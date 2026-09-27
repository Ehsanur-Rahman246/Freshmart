import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Driver from "../models/Driver.js";
import { REFUND_TIERS, PRE_PICKUP_STATUSES } from "./refundPolicy.js";
import { releaseStock, releaseStockDelayed } from "./stock.js";

// Returns null if the order can't be cancelled (or someone else won the race).
export const cancelOrderCore = async (
  orderId,
  {
    extraFilter = {},
    finalStatus = "cancelled",
    refundPercentageOverride,
  } = {},
) => {
  const prior = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: { $in: Object.keys(REFUND_TIERS) },
      ...extraFilter,
    },
    {
      $set: {
        status: finalStatus,
        cancelledAt: new Date(),
        "delivery.nextTransitionAt": null,
        processingReadyAt: null,
        paymentDueAt: null,
      },
    },
    { returnDocument: "before" },
  );

  if (!prior) return null;

  const refundPercentage =
    refundPercentageOverride ?? REFUND_TIERS[prior.status];
  const { pointsRedeemed = 0, debtSettled = 0, total } = prior.pricing;

  const chargeable = Math.max(total - debtSettled, 0);
  const refundAmount = Math.round((chargeable * refundPercentage) / 100);
  const isPaidOnline =
    prior.payment.method === "online" && prior.payment.status === "paid";

  let pointsBack = pointsRedeemed;
  let debtBack = 0;

  if (isPaidOnline) {
    pointsBack += refundAmount; // debtSettled was paid online, stays paid
  } else {
    debtBack += debtSettled; // never paid, owed again
    if (prior.payment.method === "cashOnDelivery") {
      debtBack += chargeable - refundAmount; // forfeited part
    }
  }

  if (pointsBack > 0 || debtBack > 0) {
    await Customer.updateOne(
      { _id: prior.customer },
      { $inc: { pointsBalance: pointsBack, debtBalance: debtBack } },
    );
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        refund: { percentage: refundPercentage, amount: refundAmount },
        ...(isPaidOnline ? { "payment.status": "refunded" } : {}),
      },
    },
    { returnDocument: "after" },
  );

  const items = prior.items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
  }));

  if (PRE_PICKUP_STATUSES.includes(prior.status)) {
    await releaseStock(items);
  } else {
    await releaseStockDelayed(items);
  }

  if (prior.delivery?.driver?.driverId) {
    await Driver.updateOne(
      { _id: prior.delivery.driver.driverId },
      { $set: { isAvailable: true } },
    );
  }

  return { order, priorStatus: prior.status, refundPercentage, refundAmount };
};
