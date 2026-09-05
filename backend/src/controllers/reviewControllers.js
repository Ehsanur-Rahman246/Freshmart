import mongoose from "mongoose";
import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";

// ==========================================
// CREATE PRODUCT REVIEW
// ==========================================

export const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const { orderId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customer._id,
      status: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You can only review products from your delivered orders",
      });
    }

    const productExistsInOrder = order.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!productExistsInOrder) {
      return res.status(400).json({
        success: false,
        message: "This product was not included in this order",
      });
    }

    const existingReview = await Review.findOne({
      customer: customer._id,
      order: order._id,
      product: product._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product for this order",
      });
    }

    const review = await Review.create({
      customer: customer._id,
      order: order._id,
      product: product._id,
      rating: Number(rating),
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Product review created successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// CREATE FARM REVIEW
// ==========================================

export const createFarmReview = async (req, res) => {
  try {
    const { farmId } = req.params;

    const { orderId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customer._id,
      farm: farm._id,
      status: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You can only review farms from your delivered orders",
      });
    }

    const existingReview = await Review.findOne({
      customer: customer._id,
      order: order._id,
      farm: farm._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this farm for this order",
      });
    }

    const review = await Review.create({
      customer: customer._id,
      order: order._id,
      farm: farm._id,
      rating: Number(rating),
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Farm review created successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// GET PRODUCT REVIEWS
// PUBLIC
// ==========================================

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const reviews = await Review.find({
      product: productId,
    })
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// GET FARM REVIEWS
// PUBLIC
// ==========================================

export const getFarmReviews = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const reviews = await Review.find({
      farm: farmId,
    })
      .populate({
        path: "customer",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// UPDATE REVIEW
// ==========================================

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const review = await Review.findOne({
      _id: reviewId,
      customer: customer._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized to update it",
      });
    }

    if (rating !== undefined) {
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// DELETE REVIEW
// ==========================================

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      customer: customer._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
