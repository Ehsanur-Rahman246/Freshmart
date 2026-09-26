import mongoose from "mongoose";
import PromoCode from "../models/PromoCode.js";

export const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      oncePerCustomer,
      expiresAt,
    } = req.body;

    if (!code || !code.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }
    if (!["flat", "percentage"].includes(discountType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Discount value must be greater than 0",
        });
    }
    if (discountType === "percentage" && value > 100) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Percentage discount cannot exceed 100",
        });
    }

    let maxDiscountValue = null;
    if (
      discountType === "percentage" &&
      maxDiscount !== undefined &&
      maxDiscount !== null &&
      maxDiscount !== ""
    ) {
      maxDiscountValue = Number(maxDiscount);
      if (!Number.isFinite(maxDiscountValue) || maxDiscountValue < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid max discount" });
      }
    }

    const minOrder = Number(minOrderValue) || 0;
    if (minOrder < 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Minimum order value cannot be negative",
        });
    }

    let limit = null;
    if (usageLimit !== undefined && usageLimit !== null && usageLimit !== "") {
      limit = Number(usageLimit);
      if (!Number.isInteger(limit) || limit < 1) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Usage limit must be a whole number of 1 or more",
          });
      }
    }

    let expiry = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (Number.isNaN(expiry.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry date" });
      }
    }

    const existing = await PromoCode.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          message: "A promo code with this name already exists",
        });
    }

    const promoCode = await PromoCode.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: value,
      maxDiscount: maxDiscountValue,
      minOrderValue: minOrder,
      usageLimit: limit,
      oncePerCustomer: oncePerCustomer !== false,
      expiresAt: expiry,
      createdBy: req.user.userId,
    });

    return res
      .status(201)
      .json({ success: true, message: "Promo code created", promoCode });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, promoCodes });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const { promoCodeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(promoCodeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid promo code ID" });
    }

    const promoCode = await PromoCode.findById(promoCodeId);
    if (!promoCode) {
      return res
        .status(404)
        .json({ success: false, message: "Promo code not found" });
    }

    const {
      isActive,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      oncePerCustomer,
      expiresAt,
    } = req.body;

    if (isActive !== undefined) promoCode.isActive = isActive === true;

    if (discountValue !== undefined) {
      const value = Number(discountValue);
      if (!Number.isFinite(value) || value <= 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Discount value must be greater than 0",
          });
      }
      if (promoCode.discountType === "percentage" && value > 100) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Percentage discount cannot exceed 100",
          });
      }
      promoCode.discountValue = value;
    }

    if (maxDiscount !== undefined) {
      if (maxDiscount === null || maxDiscount === "") {
        promoCode.maxDiscount = null;
      } else {
        const value = Number(maxDiscount);
        if (!Number.isFinite(value) || value < 0) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid max discount" });
        }
        promoCode.maxDiscount = value;
      }
    }

    if (minOrderValue !== undefined) {
      const value = Number(minOrderValue);
      if (!Number.isFinite(value) || value < 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Minimum order value cannot be negative",
          });
      }
      promoCode.minOrderValue = value;
    }

    if (usageLimit !== undefined) {
      if (usageLimit === null || usageLimit === "") {
        promoCode.usageLimit = null;
      } else {
        const value = Number(usageLimit);
        if (!Number.isInteger(value) || value < 1) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Usage limit must be a whole number of 1 or more",
            });
        }
        promoCode.usageLimit = value;
      }
    }

    if (oncePerCustomer !== undefined)
      promoCode.oncePerCustomer = oncePerCustomer === true;

    if (expiresAt !== undefined) {
      if (!expiresAt) {
        promoCode.expiresAt = null;
      } else {
        const expiry = new Date(expiresAt);
        if (Number.isNaN(expiry.getTime())) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry date" });
        }
        promoCode.expiresAt = expiry;
      }
    }

    await promoCode.save();

    return res
      .status(200)
      .json({ success: true, message: "Promo code updated", promoCode });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
