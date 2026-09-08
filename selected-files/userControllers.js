import mongoose from "mongoose";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Customer from "../models/Customer.js";
import Farm from "../models/Farm.js";

const SAFE_USER_FIELDS =
  "-password -verificationOTP -verificationOTPExpireAt -passwordResetOTP -passwordResetOTPExpireAt";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("user", SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    const farmers = await Farmer.find()
      .populate("user", SAFE_USER_FIELDS)
      .populate("farms", "name isActive location");

    return res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    const farms = await Farm.find().populate({
      path: "farmer",
      select: "profileImage",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(200).json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
