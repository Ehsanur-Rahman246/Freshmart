import mongoose from "mongoose";
import { PRODUCT_ENUMS } from "../utils/productValidation.js";

const pricingRangeSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },

    // lowercase/trimmed match key — "Tomato" and "tomato " share one range
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // cosmetic only — picks the icon, doesn't affect matching
    category: { type: String, enum: PRODUCT_ENUMS.category, required: true },
    unit: { type: String, enum: PRODUCT_ENUMS.unit, required: true },

    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const PricingRange = mongoose.model("PricingRange", pricingRangeSchema);

export default PricingRange;
