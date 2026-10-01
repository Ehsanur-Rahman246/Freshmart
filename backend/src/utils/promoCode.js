import PromoCode from "../models/PromoCode.js";
import PromoCodeUsage from "../models/PromoCodeUsage.js";

// Read-only check — safe to call before any stock/balance writes.
export const validateAndComputePromo = async ({
  code,
  customerId,
  itemsTotal,
}) => {
  const promo = await PromoCode.findOne({ code: code.trim().toUpperCase() });

  if (!promo || !promo.isActive) {
    return { error: "Invalid or inactive promo code" };
  }

  if (promo.expiresAt && promo.expiresAt <= new Date()) {
    return { error: "This promo code has expired" };
  }

  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return { error: "This promo code has reached its usage limit" };
  }

  if (itemsTotal < promo.minOrderValue) {
    return {
      error: `This promo code requires a minimum order of ৳${promo.minOrderValue}`,
    };
  }

  if (promo.oncePerCustomer) {
    const alreadyUsed = await PromoCodeUsage.exists({
      promoCode: promo._id,
      customer: customerId,
    });
    if (alreadyUsed) {
      return { error: "You have already used this promo code" };
    }
  }

  let discountAmount =
    promo.discountType === "flat"
      ? promo.discountValue
      : Math.round(itemsTotal * (promo.discountValue / 100) * 100) / 100;

  if (promo.discountType === "percentage" && promo.maxDiscount !== null) {
    discountAmount = Math.min(discountAmount, promo.maxDiscount);
  }

  discountAmount = Math.min(discountAmount, itemsTotal);

  return { promoCode: promo, discountAmount };
};

// Atomic claim — guards the usageLimit race the same way reserveStock guards stock.
export const claimPromoUsage = async (promoId, usageLimit) => {
  const filter = { _id: promoId };
  if (usageLimit !== null) filter.usedCount = { $lt: usageLimit };

  const result = await PromoCode.updateOne(filter, { $inc: { usedCount: 1 } });
  return result.modifiedCount === 1;
};

export const releasePromoUsage = async (promoId) => {
  await PromoCode.updateOne({ _id: promoId }, { $inc: { usedCount: -1 } });
};

export const recordPromoUsage = async ({
  promoId,
  customerId,
  orderGroup,
  discountAmount,
  oncePerCustomer,
}) => {
  if (!oncePerCustomer) return;
  await PromoCodeUsage.create({
    promoCode: promoId,
    customer: customerId,
    orderGroup,
    discountAmount,
  });
};

export const releasePromoCustomerUsage = async ({ promoId, customerId }) => {
  await PromoCodeUsage.deleteOne({ promoCode: promoId, customer: customerId });
};
