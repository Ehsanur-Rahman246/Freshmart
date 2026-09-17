import express from "express";

import {
  createProductReview,
  createFarmReview,
  getProductReviews,
  getFarmReviews,
  updateReview,
  deleteReview,
  addReviewReply,
  reportReview,
  getMyReviews,
  getFarmerReviews,
  getAllReviewsAdmin,
  adminDeleteReview,
  deleteReply,
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
reviewRouter.post(
  "/farm/:farmId",
  userAuth,
  roleAuth("customer"),
  createFarmReview,
);
reviewRouter.patch("/:reviewId", userAuth, roleAuth("customer"), updateReview);
reviewRouter.delete("/:reviewId", userAuth, roleAuth("customer"), deleteReview);

// CUSTOMER
reviewRouter.get("/mine", userAuth, roleAuth("customer"), getMyReviews);

// FARMER
reviewRouter.get(
  "/farmer/mine",
  userAuth,
  roleAuth("farmer"),
  getFarmerReviews,
);

// ADMIN
reviewRouter.get("/admin/all", userAuth, roleAuth("admin"), getAllReviewsAdmin);
reviewRouter.delete(
  "/admin/:reviewId",
  userAuth,
  roleAuth("admin"),
  adminDeleteReview,
);
reviewRouter.delete(
  "/:reviewId/reply/:replyId",
  userAuth,
  roleAuth("customer", "farmer", "admin"),
  deleteReply,
);

// SHARED
reviewRouter.post(
  "/:reviewId/reply",
  userAuth,
  roleAuth("customer", "farmer", "admin"),
  addReviewReply,
);
reviewRouter.post(
  "/:reviewId/report",
  userAuth,
  roleAuth("customer", "farmer", "admin"),
  reportReview,
);

export default reviewRouter;
