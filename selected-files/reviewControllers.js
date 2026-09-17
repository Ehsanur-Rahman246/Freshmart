import mongoose from "mongoose";
import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";
import Farmer from "../models/Farmer.js";
import createNotification from "../utils/createNotification.js";
import notifyAdmin from "../utils/notifyAdmin.js";

// Reply.author is a User ref, but profile images live on Customer/Farmer docs,
// so after populating name we do a second batch lookup for images.
const attachReplyProfiles = async (reviews) => {
  const farmerUserIds = new Set();
  const customerUserIds = new Set();

  for (const review of reviews) {
    for (const reply of review.replies) {
      if (reply.authorRole === "farmer")
        farmerUserIds.add(reply.author._id.toString());
      if (reply.authorRole === "customer")
        customerUserIds.add(reply.author._id.toString());
    }
  }

  const [farmers, customers] = await Promise.all([
    Farmer.find({ user: { $in: [...farmerUserIds] } }).select(
      "user profileImage",
    ),
    Customer.find({ user: { $in: [...customerUserIds] } }).select(
      "user profileImage",
    ),
  ]);

  const farmerImages = new Map(
    farmers.map((f) => [f.user.toString(), f.profileImage?.url || null]),
  );
  const customerImages = new Map(
    customers.map((c) => [c.user.toString(), c.profileImage?.url || null]),
  );

  for (const review of reviews) {
    for (const reply of review.replies) {
      const uid = reply.author._id.toString();
      reply.authorProfileImage =
        reply.authorRole === "farmer"
          ? farmerImages.get(uid) || null
          : reply.authorRole === "customer"
            ? customerImages.get(uid) || null
            : null; // admin — placeholder only
    }
  }

  return reviews;
};

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

    const farmer = await Farmer.findById(order.farmer);
    if (farmer) {
      await createNotification({
        recipient: farmer.user,
        recipientRole: "farmer",
        type: "reviewReceived",
        title: "New Product Review",
        message: `A customer left a ${rating}-star review for one of your products.`,
        relatedOrder: order._id,
        relatedProduct: product._id,
      });
    }

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

    const farmer = await Farmer.findById(order.farmer);

    if (farmer) {
      await createNotification({
        recipient: farmer.user,
        recipientRole: "farmer",
        type: "reviewReceived",
        title: "New Farm Review",
        message: `A customer left a ${rating}-star review for your farm.`,
        relatedOrder: order._id,
      });
    }

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

// SHARED — reply
export const addReviewReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Reply message is required" });
    }

    const review = await Review.findById(reviewId)
      .populate("product")
      .populate("farm");
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (req.user.role === "customer") {
      const customer = await Customer.findOne({ user: req.user.userId });
      if (!customer || review.customer.toString() !== customer._id.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized to reply" });
      }
    } else if (req.user.role === "farmer") {
      const farmer = await Farmer.findOne({ user: req.user.userId });

      if (!farmer) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized to reply" });
      }

      const ownsProduct =
        review.product &&
        review.product.farmer.toString() === farmer._id.toString();
      const ownsFarm =
        review.farm && review.farm.farmer.toString() === farmer._id.toString();

      if (!ownsProduct && !ownsFarm) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized to reply" });
      }
    }

    review.replies.push({
      author: req.user.userId,
      authorRole: req.user.role,
      message: message.trim(),
    });

    await review.save();

    return res
      .status(201)
      .json({ success: true, message: "Reply added", review });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// SHARED — report (review or a reply) to admin
export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "A message is required to report" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    await notifyAdmin({
      type: "reviewReported",
      title: "Review Reported",
      message: message.trim(),
      relatedOrder: review.order,
    });

    return res
      .status(200)
      .json({ success: true, message: "Reported to admin" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// CUSTOMER — own reviews
export const getMyReviews = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user.userId });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer profile not found" });
    }

    const reviews = await Review.find({ customer: customer._id })
      .populate("product", "name")
      .populate("farm", "name")
      .populate("replies.author", "name")
      .sort({ createdAt: -1 })
      .lean();

    await attachReplyProfiles(reviews);

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// FARMER — reviews on own farms/products
export const getFarmerReviews = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user.userId });
    if (!farmer) {
      return res
        .status(404)
        .json({ success: false, message: "Farmer profile not found" });
    }

    const farms = await Farm.find({ farmer: farmer._id }).select("_id");
    const products = await Product.find({ farmer: farmer._id }).select("_id");

    const reviews = await Review.find({
      $or: [
        { farm: { $in: farms.map((f) => f._id) } },
        { product: { $in: products.map((p) => p._id) } },
      ],
    })
      .populate({
        path: "customer",
        populate: { path: "user", select: "name" },
      })
      .populate("product", "name")
      .populate("farm", "name")
      .populate("replies.author", "name")
      .sort({ createdAt: -1 })
      .lean();

    await attachReplyProfiles(reviews);

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADMIN
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "customer",
        populate: { path: "user", select: "name" },
      })
      .populate("product", "name")
      .populate("farm", "name")
      .populate("replies.author", "name")
      .sort({ createdAt: -1 })
      .lean();

    await attachReplyProfiles(reviews);

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found" });
    }

    const isAuthor = reply.author.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply",
      });
    }

    reply.deleteOne();
    await review.save();

    return res.status(200).json({ success: true, message: "Reply deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
