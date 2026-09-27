import Order from "../models/Order.js";
import { HOUR_IN_MS, PAYMENT_WINDOW_HOURS } from "../config/time.js";
import { emitOrderStatusToCustomer } from "./realtime.js";
import { notifyCustomer } from "./notifyCustomer.js";

// Opens payment for a group once no order is still waiting on its farmer.
export const openGroupPaymentIfReady = async (orderGroup) => {
  if (await Order.exists({ orderGroup, status: "pendingAcceptance" })) {
    return false;
  }

  const waiting = await Order.find({
    orderGroup,
    status: "orderPlaced",
  }).select("_id");
  if (waiting.length === 0) return false;

  const ids = waiting.map((o) => o._id);
  const paymentDueAt = new Date(Date.now() + PAYMENT_WINDOW_HOURS * HOUR_IN_MS);

  const result = await Order.updateMany(
    { _id: { $in: ids }, status: "orderPlaced" },
    { $set: { status: "paymentPending", paymentDueAt } },
  );
  if (result.modifiedCount === 0) return false; // another accept already opened it

  const opened = await Order.find({
    _id: { $in: ids },
    status: "paymentPending",
    paymentDueAt,
  });
  if (opened.length === 0) return false;

  for (const o of opened) await emitOrderStatusToCustomer(o);

  await notifyCustomer(opened[0].customer, {
    type: "paymentRequired",
    title: "Payment Required",
    message:
      "All farms have responded. Please complete one online payment for your order.",
    relatedOrder: opened[0]._id,
  });

  return true;
};
