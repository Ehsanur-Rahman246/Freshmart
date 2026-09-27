import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true,
    },

    discountValue: { type: Number, required: true, min: 0 },

    // only used when discountType === "percentage"
    maxDiscount: { type: Number, default: null, min: 0 },

    minOrderValue: { type: Number, default: 0, min: 0 },

    usageLimit: { type: Number, default: null, min: 1 }, // null = unlimited
    usedCount: { type: Number, default: 0, min: 0 },

    oncePerCustomer: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },

    expiresAt: { type: Date, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;
