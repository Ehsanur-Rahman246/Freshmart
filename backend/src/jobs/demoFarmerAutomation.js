import cron from "node-cron";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";
import Customer from "../models/Customer.js";
import createNotification from "../utils/createNotification.js";
import transporter from "../config/nodemailer.js";
import {
  HOUR_IN_MS,
  CRON_INTERVAL,
  FARMER_RESPONSE_WINDOW_HOURS,
} from "../config/time.js";
import {
  DEMO_COMPANY_NAME,
  COMPANY_SALE_DISCOUNT,
  DEMO_RESTOCK_QUANTITY,
} from "../config/business.js";
import { recordCompanySaleRevenue } from "../utils/recordRevenue.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import { tryAutoAssignDriver } from "../controllers/deliveryControllers.js";
import { autoCancelOrder } from "../controllers/orderControllers.js";

// 1. Demo orders: processing -> readyForPickup, automatically.
const advanceDemoOrders = async () => {
  const now = new Date();

  const dueOrders = await Order.find({
    status: "processing",
    isDemoOrder: true,
    processingReadyAt: { $lte: now },
  });

  for (const order of dueOrders) {
    order.status = "readyForPickup";
    order.processingReadyAt = null;
    await order.save();

    const customer = await Customer.findById(order.customer).populate("user");
    if (customer) {
      await createNotification({
        recipient: customer.user._id,
        recipientRole: "customer",
        type: "readyForPickup",
        title: "Order Ready for Pickup",
        message: "Your order has been prepared and is ready for pickup.",
        relatedOrder: order._id,
      });

      // Demo customers skip the admin driver-assignment queue: try once,
      // auto-cancel if nobody's available right now.
      if (customer.isDemo) {
        const driverAssigned = await tryAutoAssignDriver(order);

        if (!driverAssigned) {
          await autoCancelOrder({
            order,
            customer,
            reason: "No driver was available for this order",
          });

          // Order is now cancelled — skip the admin notification below,
          // there's nothing for an admin to act on.
          continue;
        }
      }
    }

    await notifyAdmin({
      type: "readyForPickup",
      title: "Order Ready for Pickup",
      message: `Order ${order.orderNumber} is ready for pickup and needs a driver assigned.`,
      relatedOrder: order._id,
    });
  }
};

// 2. Listings that ran out of stock before expiring: mark soldOut,
// schedule a restock if the farmer is a demo farmer.
const handleOutOfStock = async () => {
  const now = new Date();

  const zeroStockProducts = await Product.find({
    status: "active",
    stock: { $lte: 0 },
  }).populate({ path: "farmer", select: "isDemo" });

  for (const product of zeroStockProducts) {
    product.status = "soldOut";

    if (product.farmer?.isDemo) {
      product.nextRestockAt = product.expiresAt;
    }

    await product.save();
  }
};

// 3. Demo listings due for restock: clone into a fresh active listing.
// The old (sold-out) listing stays exactly as-is for historical/order
// reference and is never reactivated.
const handleRestocking = async () => {
  const now = new Date();

  const dueRestocks = await Product.find({
    status: "soldOut",
    nextRestockAt: { $lte: now },
  });

  // after
  for (const product of dueRestocks) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + product.listingDuration);

    product.stock = DEMO_RESTOCK_QUANTITY;
    product.status = "active";
    product.expiresAt = expiresAt;
    product.nextRestockAt = null;

    await product.save();
  }
};

// 4. Listings that expired with stock still remaining.
// Demo farmer -> instantly sold to a fixed placeholder company.
// Real farmer -> emailed with a company-sale offer, awaiting their response.
// NEW — exported so the restock-maturity job can reuse this
export const processExpiredProduct = async (product) => {
  const now = new Date();
  const companySalePrice =
    Math.round(product.price * (1 - COMPANY_SALE_DISCOUNT) * 100) / 100;

  if (product.farmer?.isDemo) {
    const quantitySold = product.stock;

    product.companySalePrice = companySalePrice;
    product.company = DEMO_COMPANY_NAME;
    product.soldToCompanyAt = now;
    product.companySaleStage = "sold";

    await recordCompanySaleRevenue(product, quantitySold);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + product.listingDuration);

    product.stock = DEMO_RESTOCK_QUANTITY;
    product.status = "active";
    product.expiresAt = expiresAt;

    await product.save();
  } else {
    product.status = "expired";
    product.companySaleStage = "awaitingFarmerResponse";
    product.companySalePrice = companySalePrice;
    product.companySaleRespondBy = new Date(
      now.getTime() + FARMER_RESPONSE_WINDOW_HOURS * HOUR_IN_MS,
    );

    await product.save();

    if (product.farmer?.user?.email) {
      try {
        await transporter.sendMail({
          /* unchanged existing template */
        });
      } catch (emailError) {
        console.error("Failed to send listing-expired email:", emailError);
      }
    }

    if (product.farmer?.user?._id) {
      await createNotification({
        /* unchanged existing farmer notification */
      });
    }

    await notifyAdmin({
      type: "productExpired",
      title: "Listing Expired — Awaiting Farmer Response",
      message: `${product.name} expired and a company-sale offer was sent to the farmer.`,
      relatedProduct: product._id,
    });
  }
};

const handleExpiredProducts = async () => {
  const expiredProducts = await Product.find({
    status: "active",
    expiresAt: { $lte: new Date() },
    stock: { $gt: 0 },
  }).populate({
    path: "farmer",
    select: "isDemo user",
    populate: { path: "user", select: "name email" },
  });

  for (const product of expiredProducts) {
    await processExpiredProduct(product);
  }
};

// 5. Real-farmer company-sale offers that timed out with no response.
const handleUnansweredOffers = async () => {
  const now = new Date();

  const overdue = await Product.find({
    companySaleStage: "awaitingFarmerResponse",
    companySaleRespondBy: { $lte: now },
  });

  for (const product of overdue) {
    product.companySaleStage = "rejected";
    product.status = "inactive";
    product.stock = 0;
    product.companySaleRespondBy = null;
    await product.save();
  }
};

export const startDemoFarmerScheduler = () => {
  cron.schedule(CRON_INTERVAL, async () => {
    try {
      await advanceDemoOrders();
      await handleOutOfStock();
      await handleExpiredProducts();
      await handleUnansweredOffers();
      await handleRestocking();
    } catch (error) {
      console.error("Demo farmer automation error:", error);
    }
  });

  console.log("Demo farmer automation scheduler started");
};
