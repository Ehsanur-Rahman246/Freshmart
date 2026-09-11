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
  DEMO_RESTOCK_GAP_HOURS,
  FARMER_RESPONSE_WINDOW_HOURS,
} from "../config/time.js";
import {
  DEMO_COMPANY_NAME,
  COMPANY_SALE_DISCOUNT,
  DEMO_RESTOCK_QUANTITY,
} from "../config/business.js";
import { recordCompanySaleRevenue } from "../utils/recordRevenue.js";
import notifyAdmin from "../utils/notifyAdmin.js";

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
      product.nextRestockAt = new Date(
        now.getTime() + DEMO_RESTOCK_GAP_HOURS * HOUR_IN_MS,
      );
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

  for (const oldProduct of dueRestocks) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + oldProduct.listingDuration);

    const newProduct = await Product.create({
      farmer: oldProduct.farmer,
      farm: oldProduct.farm,
      name: oldProduct.name,
      description: oldProduct.description,
      images: oldProduct.images,
      category: oldProduct.category,
      subCategory: oldProduct.subCategory,
      season: oldProduct.season,
      source: oldProduct.source,
      price: oldProduct.price,
      unit: oldProduct.unit,
      stock: DEMO_RESTOCK_QUANTITY,
      discountPercentage: oldProduct.discountPercentage,
      listingDuration: oldProduct.listingDuration,
      expiresAt,
      status: "active",
    });

    const farm = await Farm.findById(oldProduct.farm);
    if (farm) {
      farm.products[oldProduct.season].push(newProduct._id);
      await farm.save();
    }

    oldProduct.nextRestockAt = null;
    await oldProduct.save();
  }
};

// 4. Listings that expired with stock still remaining.
// Demo farmer -> instantly sold to a fixed placeholder company.
// Real farmer -> emailed with a company-sale offer, awaiting their response.
const handleExpiredProducts = async () => {
  const now = new Date();

  const expiredProducts = await Product.find({
    status: "active",
    expiresAt: { $lte: now },
    stock: { $gt: 0 },
  }).populate({
    path: "farmer",
    select: "isDemo user",
    populate: { path: "user", select: "name email" },
  });

  for (const product of expiredProducts) {
    const companySalePrice =
      Math.round(product.price * (1 - COMPANY_SALE_DISCOUNT) * 100) / 100;

    if (product.farmer?.isDemo) {
      const quantitySold = product.stock;

      product.status = "soldToCompany";
      product.companySaleStage = "sold";
      product.companySalePrice = companySalePrice;
      product.company = DEMO_COMPANY_NAME;
      product.soldToCompanyAt = now;
      product.stock = 0;

      await product.save();

      await recordCompanySaleRevenue(product, quantitySold);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + product.listingDuration);

      const newProduct = await Product.create({
        farmer: product.farmer,
        farm: product.farm,
        name: product.name,
        description: product.description,
        images: product.images,
        category: product.category,
        subCategory: product.subCategory,
        season: product.season,
        source: product.source,
        price: product.price,
        unit: product.unit,
        stock: DEMO_RESTOCK_QUANTITY,
        discountPercentage: product.discountPercentage,
        listingDuration: product.listingDuration,
        expiresAt,
        status: "active",
      });

      const farm = await Farm.findById(product.farm);

      if (farm) {
        farm.products[product.season].push(newProduct._id);
        await farm.save();
      }
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
            subject: "Your FreshMart Listing Has Expired",
            html: `
              <h2>Listing Expired</h2>
              <p>Hello ${product.farmer.user.name || "Farmer"},</p>
              <p>
                Your listing for <strong>${product.name}</strong> has expired
                with ${product.stock} ${product.unit} left unsold.
              </p>
              <p>
                FreshMart can purchase the remaining stock directly at
                ${companySalePrice} per ${product.unit}. Accept this offer
                from your dashboard to proceed, or it will be automatically
                declined if there is no response within a few days.
              </p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send listing-expired email:", emailError);
        }
      }

      if (product.farmer?.user?._id) {
        await createNotification({
          recipient: product.farmer.user._id,
          recipientRole: "farmer",
          type: "productExpired",
          title: "Listing Expired",
          message: `Your listing for ${product.name} has expired. You can accept FreshMart's company-sale offer from your dashboard.`,
          relatedProduct: product._id,
        });
      }
    }
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
