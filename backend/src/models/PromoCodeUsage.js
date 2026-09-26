import mongoose from "mongoose";

// Only written for codes with oncePerCustomer: true — its whole job is
// dedup-checking. Global usage counting lives on PromoCode.usedCount.
const promoCodeUsageSchema = new mongoose.Schema(
  {
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    orderGroup: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    discountAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

promoCodeUsageSchema.index({ promoCode: 1, customer: 1 }, { unique: true });

const PromoCodeUsage = mongoose.model("PromoCodeUsage", promoCodeUsageSchema);

export default PromoCodeUsage;
