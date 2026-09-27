import PricingRange from "../models/PricingRange.js";

// null if admin hasn't set a range for this product name yet (unrestricted)
export const getRangeForName = (name) =>
  PricingRange.findOne({
    normalizedName: String(name || "")
      .trim()
      .toLowerCase(),
  });
