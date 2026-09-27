import mongoose from "mongoose";
import PricingRange from "../models/PricingRange.js";
import PriceLedger from "../models/PriceLedger.js";
import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import { PRODUCT_ENUMS } from "../utils/productValidation.js";
import { escapeRegex } from "../utils/escapeRegex.js";

export const getPricingRanges = async (req, res) => {
  try {
    const ranges = await PricingRange.find().sort({ productName: 1 });
    return res.status(200).json({ success: true, ranges });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const clampAffectedProducts = async (normalizedName, minNum, maxNum) => {
  const regex = new RegExp(`^${escapeRegex(normalizedName)}$`, "i");

  const affected = await Product.find({
    name: regex,
    status: { $in: ["active", "soldOut"] },
    $or: [{ price: { $lt: minNum } }, { price: { $gt: maxNum } }],
  });

  for (const product of affected) {
    const oldPrice = product.price;
    product.price = Math.min(Math.max(oldPrice, minNum), maxNum);
    await product.save();

    await PriceLedger.create({
      product: product._id,
      productName: product.name,
      oldPrice,
      newPrice: product.price,
      reason: "adminRangeClamp",
    });
  }

  return affected.length;
};

// ADMIN — create a new range for a product name
export const createPricingRange = async (req, res) => {
  try {
    const { name, category, unit, min, max } = req.body;
    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
      return res
        .status(400)
        .json({ success: false, message: "Product name is required" });
    }
    if (!PRODUCT_ENUMS.category.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }
    if (!PRODUCT_ENUMS.unit.includes(unit)) {
      return res.status(400).json({ success: false, message: "Invalid unit" });
    }

    const minNum = Number(min);
    const maxNum = Number(max);

    if (
      !Number.isFinite(minNum) ||
      !Number.isFinite(maxNum) ||
      minNum < 0 ||
      maxNum <= minNum
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid min and max (max > min) are required",
      });
    }

    const normalizedName = trimmedName.toLowerCase();
    const existing = await PricingRange.findOne({ normalizedName });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A price range for this product name already exists",
      });
    }

    const range = await PricingRange.create({
      productName: trimmedName,
      normalizedName,
      category,
      unit,
      min: minNum,
      max: maxNum,
    });

    const clampedCount = await clampAffectedProducts(
      normalizedName,
      minNum,
      maxNum,
    );

    await PriceLedger.create({
      productName: trimmedName,
      reason: "rangeCreated",
      rangeMin: minNum,
      rangeMax: maxNum,
    });

    return res.status(201).json({
      success: true,
      message: `Range created${clampedCount > 0 ? `, ${clampedCount} product(s) clamped` : ""}`,
      range,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — update an existing range's category/min/max; clamps any product outside it
export const updatePricingRange = async (req, res) => {
  try {
    const normalizedName = decodeURIComponent(req.params.name || "")
      .trim()
      .toLowerCase();
    const { category, min, max } = req.body;

    const range = await PricingRange.findOne({ normalizedName });
    if (!range) {
      return res
        .status(404)
        .json({ success: false, message: "Pricing range not found" });
    }

    if (category !== undefined) {
      if (!PRODUCT_ENUMS.category.includes(category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      }
      range.category = category;
    }

    const minNum = Number(min);
    const maxNum = Number(max);

    if (
      !Number.isFinite(minNum) ||
      !Number.isFinite(maxNum) ||
      minNum < 0 ||
      maxNum <= minNum
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid min and max (max > min) are required",
      });
    }

    range.min = minNum;
    range.max = maxNum;
    await range.save();

    const clampedCount = await clampAffectedProducts(
      normalizedName,
      minNum,
      maxNum,
    );

    await PriceLedger.create({
      productName: range.productName,
      reason: "rangeUpdated",
      rangeMin: minNum,
      rangeMax: maxNum,
    });

    return res.status(200).json({
      success: true,
      message: `Range updated${clampedCount > 0 ? `, ${clampedCount} product(s) clamped` : ""}`,
      range,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN — delete a pricing range; logs a neutral ledger entry, no price data
export const deletePricingRange = async (req, res) => {
  try {
    const normalizedName = decodeURIComponent(req.params.name || "")
      .trim()
      .toLowerCase();

    const range = await PricingRange.findOneAndDelete({ normalizedName });

    if (!range) {
      return res
        .status(404)
        .json({ success: false, message: "Pricing range not found" });
    }

    await PriceLedger.create({
      productName: range.productName,
      reason: "rangeDeleted",
      rangeMin: range.min,
      rangeMax: range.max,
    });

    return res
      .status(200)
      .json({ success: true, message: "Pricing range deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getProductPriceLedger = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select("farmer");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (req.user.role === "farmer") {
      const farmer = await Farmer.findOne({ user: req.user.userId }).select(
        "_id",
      );
      if (!farmer || farmer._id.toString() !== product.farmer.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }
    }

    const entries = await PriceLedger.find({ product: productId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// FARMER/ADMIN — universal price ledger: every admin-driven change, same
// list for every farmer, not scoped to any one farmer's own products
export const getPriceLedger = async (req, res) => {
  try {
    const entries = await PriceLedger.find()
      .populate({
        path: "product",
        select: "name category unit farm",
        populate: { path: "farm", select: "name" },
      })
      .sort({ createdAt: -1 })
      .limit(300);

    return res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
