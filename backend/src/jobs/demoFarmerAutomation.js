import cron from "node-cron";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
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
import { notifyFarmer } from "../utils/notifyFarmer.js";
import { notifyCustomer } from "../utils/notifyCustomer.js";
import { companySaleOfferEmail } from "../utils/emailTemplates.js";
import { emitOrderStatusToCustomer } from "../utils/realtime.js";

const claimDueDemoOrder = () =>
  Order.findOneAndUpdate(
    {
      status: "processing",
      isDemoOrder: true,
      processingReadyAt: { $lte: new Date() },
    },
    { $set: { status: "readyForPickup", processingReadyAt: null } },
    { returnDocument: "after" },
  );

// 1. Demo orders: processing -> readyForPickup, automatically.
const advanceDemoOrders = async () => {
  let order;

  while ((order = await claimDueDemoOrder())) {
    await emitOrderStatusToCustomer(order);
    
    const customer = await Customer.findById(order.customer).populate("user");
    let driverAutoAssigned = false;
    if (customer) {
      await notifyCustomer(order.customer, {
        type: "readyForPickup",
        title: "Order Ready for Pickup",
        message: "Your order has been prepared and is ready for pickup.",
        relatedOrder: order._id,
      });

      if (customer.isDemo) {
        driverAutoAssigned = await tryAutoAssignDriver(order);

        if (!driverAutoAssigned) {
          await autoCancelOrder({
            order,
            customer,
            reason: "No driver was available for this order",
          });
          continue;
        }
      }
    }

    if (driverAutoAssigned) continue;

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

// 3. Demo listings due for restock
const handleRestocking = async () => {
  const now = new Date();

  const dueRestocks = await Product.find({
    status: "soldOut",
    nextRestockAt: { $lte: now },
  });

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
// Demo farmer -> instantly sold
// Real farmer -> emailed with a company-sale offer, awaiting their response.
// exported so the restock-maturity job can reuse this
export const processExpiredProduct = async (product) => {
  const now = new Date();
  const companySalePrice =
    Math.round(product.price * (1 - COMPANY_SALE_DISCOUNT) * 100) / 100;

  if (product.farmer?.isDemo) {
    const quantitySold = product.stock;

    product.companySalePrice = companySalePrice;
    product.company = DEMO_COMPANY_NAME;
    product.soldToCompanyAt = now;

    await recordCompanySaleRevenue(product, quantitySold);
    product.companySaleStage = "none";
    product.companySalePrice = null;

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
          from: process.env.EMAIL_USER,
          to: product.farmer.user.email,
          subject: `Company Sale Offer — ${product.name}`,
          html: companySaleOfferEmail({
            product,
            companySalePrice,
            responseWindowHours: FARMER_RESPONSE_WINDOW_HOURS,
            farmerName: product.farmer.user.name,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send listing-expired email:", emailError);
      }
    }

    if (product.farmer?.user?._id) {
      await notifyFarmer(product.farmer, {
        type: "productExpired",
        title: "Listing Expired — Company Sale Offer",
        message: `${product.name} expired with stock remaining. Respond to the company sale offer within ${FARMER_RESPONSE_WINDOW_HOURS} hours.`,
        relatedProduct: product._id,
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
  }).populate({ path: "farmer", select: "user" });

  for (const product of overdue) {
    product.companySaleStage = "rejected";
    product.status = "inactive";
    product.stock = 0;
    product.companySaleRespondBy = null;
    await product.save();

    if (product.farmer?._id) {
      await notifyFarmer(product.farmer._id, {
        type: "productExpired",
        title: "Company Sale Offer Expired",
        message: `You didn't respond in time — the offer for ${product.name} was automatically declined.`,
        relatedProduct: product._id,
      });
    }

    await notifyAdmin({
      type: "productExpired",
      title: "Company Sale Offer Auto-Rejected",
      message: `${product.name}'s company sale offer expired with no farmer response.`,
      relatedProduct: product._id,
    });
  }
};

export const startDemoFarmerScheduler = () => {
  let isRunning = false;

  cron.schedule(CRON_INTERVAL, async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      await advanceDemoOrders();
      await handleOutOfStock();
      await handleExpiredProducts();
      await handleUnansweredOffers();
      await handleRestocking();
    } catch (error) {
      console.error("Demo farmer automation error:", error);
    } finally {
      isRunning = false;
    }
  });

  console.log("Demo farmer automation scheduler started");
};
