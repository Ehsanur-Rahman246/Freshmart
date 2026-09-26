import mongoose from "mongoose";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Customer from "../models/Customer.js";
import Farm from "../models/Farm.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import { farmHasActiveWork } from "../utils/cascadeDelete.js";
import { TERMINAL_STATUSES } from "../utils/refundPolicy.js";

const countMap = (rows) =>
  new Map(rows.map((r) => [r._id.toString(), r.count]));

const SAFE_USER_FIELDS =
  "-password -verificationOTP -verificationOTPExpireAt -passwordResetOTP -passwordResetOTPExpireAt";

export const getAllCustomers = async (req, res) => {
  try {
    const [customers, orderRows, reviewRows] = await Promise.all([
      Customer.find()
        .select("-cart -wishlist")
        .populate("user", SAFE_USER_FIELDS),
      Order.aggregate([{ $group: { _id: "$customer", count: { $sum: 1 } } }]),
      Review.aggregate([{ $group: { _id: "$customer", count: { $sum: 1 } } }]),
    ]);

    const orders = countMap(orderRows);
    const reviews = countMap(reviewRows);

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers: customers.map((c) => ({
        ...c.toObject(),
        ordersCount: orders.get(c._id.toString()) || 0,
        reviewsCount: reviews.get(c._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(customerId)
      .populate("user", SAFE_USER_FIELDS)
      .populate("wishlist", "name price images");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllFarmers = async (req, res) => {
  try {
    const [farmers, orderRows, reviewRows] = await Promise.all([
      Farmer.find()
        .populate("user", SAFE_USER_FIELDS)
        .populate("farms", "name isActive location"),
      Order.aggregate([{ $group: { _id: "$farmer", count: { $sum: 1 } } }]),
      Review.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "p",
          },
        },
        {
          $lookup: {
            from: "farms",
            localField: "farm",
            foreignField: "_id",
            as: "f",
          },
        },
        {
          $addFields: {
            farmerId: {
              $ifNull: [
                { $arrayElemAt: ["$p.farmer", 0] },
                { $arrayElemAt: ["$f.farmer", 0] },
              ],
            },
          },
        },
        { $match: { farmerId: { $ne: null } } },
        { $group: { _id: "$farmerId", count: { $sum: 1 } } },
      ]),
    ]);

    const orders = countMap(orderRows);
    const reviews = countMap(reviewRows);

    return res.status(200).json({
      success: true,
      count: farmers.length,
      farmers: farmers.map((f) => ({
        ...f.toObject(),
        ordersCount: orders.get(f._id.toString()) || 0,
        reviewsCount: reviews.get(f._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getFarmerById = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID",
      });
    }

    const farmer = await Farmer.findById(farmerId)
      .populate("user", SAFE_USER_FIELDS)
      .populate("farms");

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    return res.status(200).json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllFarms = async (req, res) => {
  try {
    const search = String(req.query.search || "")
      .trim()
      .slice(0, 50);
    const filter = {};

    if (req.user?.role !== "admin") filter.isActive = true;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: regex },
        { "location.district": regex },
        { "location.upazila": regex },
        { "location.village": regex },
        { farmType: regex },
      ];
    }

    const farms = await Farm.find(filter).populate({
      path: "farmer",
      select: "profileImage",
      populate: { path: "user", select: "name" },
    });

    const stats = await Review.aggregate([
      { $match: { farm: { $in: farms.map((f) => f._id) } } },
      {
        $group: {
          _id: "$farm",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map(stats.map((s) => [s._id.toString(), s]));

    return res.status(200).json({
      success: true,
      count: farms.length,
      farms: farms.map((farm) => {
        const s = statsMap.get(farm._id.toString());
        return {
          ...farm.toObject(),
          avgRating: s ? Math.round(s.avgRating * 10) / 10 : null,
          reviewCount: s?.reviewCount || 0,
        };
      }),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deactivated",
      });
    }

    if (user.isActive) {
      // about to deactivate — refuse if it would strand active work
      if (user.role === "customer") {
        const customer = await Customer.findOne({ user: user._id });
        const hasActiveOrders =
          customer &&
          (await Order.exists({
            customer: customer._id,
            status: { $nin: TERMINAL_STATUSES },
          }));

        if (hasActiveOrders) {
          return res.status(400).json({
            success: false,
            message:
              "This customer has orders in progress and cannot be deactivated",
          });
        }
      }

      if (user.role === "farmer") {
        const farmer = await Farmer.findOne({ user: user._id }).populate(
          "farms",
        );

        if (farmer) {
          for (const farm of farmer.farms) {
            if (await farmHasActiveWork(farm._id)) {
              return res.status(400).json({
                success: false,
                message: `${farm.name} has orders or company sales in progress`,
              });
            }
          }

          await Farm.updateMany(
            { _id: { $in: farmer.farms.map((f) => f._id) } },
            { $set: { isActive: false } },
          );
        }
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
