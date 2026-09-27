import cron from "node-cron";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { CRON_INTERVAL } from "../config/time.js";
import { autoCancelOrder } from "../controllers/orderControllers.js";
import Farmer from "../models/Farmer.js";
import { FARMER_ACCEPT_WINDOW_MS } from "../config/time.js";
import { releaseStock } from "../utils/stock.js";
import { emitOrderStatusToCustomer } from "../utils/realtime.js";
import { notifyFarmer } from "../utils/notifyFarmer.js";
import { notifyCustomer } from "../utils/notifyCustomer.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import { openGroupPaymentIfReady } from "../utils/groupPayment.js";

const autoRejectStalePendingOrders = async () => {
  const cutoff = new Date(Date.now() - FARMER_ACCEPT_WINDOW_MS);

  const stale = await Order.find({
    status: "pendingAcceptance",
    createdAt: { $lte: cutoff },
  });

  for (const order of stale) {
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: "pendingAcceptance" },
      { $set: { status: "rejected" } },
      { returnDocument: "after" },
    );
    if (!updated) continue;

    await emitOrderStatusToCustomer(updated);

    const { pointsRedeemed = 0, debtSettled = 0 } = updated.pricing;
    if (pointsRedeemed > 0 || debtSettled > 0) {
      await Customer.updateOne(
        { _id: updated.customer },
        { $inc: { pointsBalance: pointsRedeemed, debtBalance: debtSettled } },
      );
    }

    await releaseStock(
      updated.items.map((i) => ({ product: i.product, quantity: i.quantity })),
    );

    await notifyCustomer(updated.customer, {
      type: "orderRejected",
      title: "Order Rejected",
      message:
        "The farmer did not respond in time, so this order was automatically rejected.",
      relatedOrder: updated._id,
    });
    await notifyFarmer(updated.farmer, {
      type: "orderRejected",
      title: "Order Auto-Rejected",
      message: `Order ${updated.orderNumber} was automatically rejected after no response.`,
      relatedOrder: updated._id,
    });
    await notifyAdmin({
      type: "orderRejected",
      title: "Order Auto-Rejected",
      message: `Order ${updated.orderNumber} was auto-rejected — farmer did not respond in time.`,
      relatedOrder: updated._id,
    });

    if (updated.payment.method === "online") {
      await openGroupPaymentIfReady(updated.orderGroup);
    }
  }
};

const cancelUnpaidOrders = async () => {
  const due = await Order.find({
    status: "paymentPending",
    paymentDueAt: { $lte: new Date() },
  });

  for (const order of due) {
    const customer = await Customer.findById(order.customer).populate("user");
    if (!customer) continue;

    await autoCancelOrder({
      order,
      customer,
      reason: "Payment was not completed in time",
    });
  }
};

export const startPaymentExpiryScheduler = () => {
  let isRunning = false;

  cron.schedule(CRON_INTERVAL, async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      await cancelUnpaidOrders();
      await autoRejectStalePendingOrders();
    } catch (error) {
      console.error("Payment expiry error:", error);
    } finally {
      isRunning = false;
    }
  });

  console.log("Payment expiry scheduler started");
};
