import express from "express";

import {
  createProductReview,
  createFarmReview,
  getProductReviews,
  getFarmReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewControllers.js";

import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";

const reviewRouter = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all reviews for a product
reviewRouter.get("/product/:productId", getProductReviews);

// Get all reviews for a farm
reviewRouter.get("/farm/:farmId", getFarmReviews);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create product review
reviewRouter.post(
  "/product/:productId",
  userAuth,
  roleAuth("customer"),
  createProductReview,
);

// Create farm review
reviewRouter.post("/farm/:farmId", userAuth, roleAuth("customer"), createFarmReview);

// Update own review
reviewRouter.patch("/:reviewId", userAuth, roleAuth("customer"), updateReview);

// Delete own review
reviewRouter.delete("/:reviewId", userAuth, roleAuth("customer"), deleteReview);

export default reviewRouter;
