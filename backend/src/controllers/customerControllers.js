import mongoose from "mongoose";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";
import { resolveDistrict } from "../utils/district.js";
import { normalizePhone } from "../utils/phone.js";

const SAFE_USER_FIELDS =
  "-password -verificationOTP -verificationOTPExpireAt -passwordResetOTP -passwordResetOTPExpireAt";

export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    })
      .populate("user", SAFE_USER_FIELDS)
      .populate({
        path: "wishlist",
        populate: { path: "farm", select: "name" },
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
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

export const updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    if (req.file) {
      if (customer.profileImage?.publicId) {
        await deleteFromCloudinary(customer.profileImage.publicId);
      }

      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "freshmart/customers/profile",
      );

      customer.profileImage = uploaded;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
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

export const getWallet = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    }).select("pointsBalance debtBalance");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      wallet: {
        pointsBalance: customer.pointsBalance,
        debtBalance: customer.debtBalance,
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

export const addAddress = async (req, res) => {
  try {
    const {
      label,
      recipientName,
      phone,
      division,
      district,
      upazila,
      village,
      address,
      isDefault,
    } = req.body;

    if (
      !recipientName ||
      !phone ||
      !division ||
      !district ||
      !upazila ||
      !village ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required address fields must be provided",
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

    const isDefaultBool = isDefault === true || isDefault === "true";

    if (isDefaultBool || customer.addresses.length === 0) {
      customer.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }
    const resolvedDistrict = await resolveDistrict(district);

    if (!resolvedDistrict) {
      return res.status(400).json({
        success: false,
        message: "We don't deliver to that district yet",
      });
    }

    const phoneClean = normalizePhone(phone);

    if (!phoneClean) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Bangladeshi mobile number",
      });
    }

    customer.addresses.push({
      label,
      recipientName: String(recipientName).trim(),
      phone: phoneClean,
      division,
      district: resolvedDistrict,
      upazila,
      village,
      address,
      isDefault: isDefaultBool || customer.addresses.length === 0,
    });

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
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

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const address = customer.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      label,
      recipientName,
      phone,
      division,
      district,
      upazila,
      village,
      address: fullAddress,
      isDefault,
    } = req.body;

    if (label !== undefined) address.label = label;
    if (recipientName !== undefined) address.recipientName = recipientName;
    if (phone !== undefined) {
      const phoneClean = normalizePhone(phone);
      if (!phoneClean) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid Bangladeshi mobile number",
        });
      }
      address.phone = phoneClean;
    }
    if (division !== undefined) address.division = division;
    if (district !== undefined) {
      const resolvedDistrict = await resolveDistrict(district);
      if (!resolvedDistrict) {
        return res.status(400).json({
          success: false,
          message: "We don't deliver to that district yet",
        });
      }
      address.district = resolvedDistrict;
    }
    if (upazila !== undefined) address.upazila = upazila;
    if (village !== undefined) address.village = village;
    if (fullAddress !== undefined) address.address = fullAddress;

    if (isDefault === true || isDefault === "true") {
      customer.addresses.forEach((item) => {
        item.isDefault = item._id.toString() === addressId;
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
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

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const address = customer.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const address = customer.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    customer.addresses.forEach((item) => {
      item.isDefault = item._id.toString() === addressId;
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      user: req.user.userId,
    }).populate({
      path: "wishlist",
      populate: { path: "farm", select: "name" },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findOne({ user: req.user.userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const alreadyInWishlist = customer.wishlist.some(
      (item) => item.toString() === productId,
    );

    if (alreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    customer.wishlist.push(productId);

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const customer = await Customer.findOne({
      user: req.user.userId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    const productIndex = customer.wishlist.findIndex(
      (item) => item.toString() === productId,
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    customer.wishlist.splice(productIndex, 1);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
