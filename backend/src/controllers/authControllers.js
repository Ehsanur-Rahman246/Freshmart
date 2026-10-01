import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import { TERMINAL_STATUSES } from "../utils/refundPolicy.js";
import {
  farmHasActiveWork,
  deleteFarmCascade,
} from "../utils/cascadeDelete.js";
import { normalizePhone } from "../utils/phone.js";
import {
  welcomeEmail,
  verificationOtpEmail,
  resetPasswordOtpEmail,
} from "../utils/emailTemplates.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (!["customer", "farmer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    try {
      if (user.role === "customer") {
        await Customer.create({ user: user._id });
        await notifyAdmin({
          type: "newCustomerRegistered",
          title: "New Customer Registered",
          message: `A new customer, ${user.name}, has registered.`,
        });
      }

      if (user.role === "farmer") {
        await Farmer.create({ user: user._id });
        await notifyAdmin({
          type: "newFarmerRegistered",
          title: "New Farmer Registered",
          message: `A new farmer, ${user.name}, has registered.`,
        });
      }
    } catch (profileError) {
      console.error(
        "Profile creation failed during registration:",
        profileError,
      );
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Could not complete registration. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to FreshMart!",
        html: welcomeEmail({ name: user.name, role: user.role }),
      });
    } catch (emailError) {
      console.error("Welcome email could not be sent:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (name === undefined && phone === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      const phoneTrimmed = String(phone ?? "").trim();

      if (phoneTrimmed) {
        const normalized = normalizePhone(phoneTrimmed);

        if (!normalized) {
          return res.status(400).json({
            success: false,
            message: "Enter a valid Bangladeshi mobile number",
          });
        }

        const existingPhone = await User.findOne({
          phone: normalized,
          _id: { $ne: user._id },
        });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: "This phone number is already in use",
          });
        }

        user.phone = normalized;
      } else {
        user.phone = undefined;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete your account",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted",
      });
    }

    if (user.role === "customer") {
      const customer = await Customer.findOne({ user: user._id });

      if (customer) {
        const active = await Order.exists({
          customer: customer._id,
          status: { $nin: TERMINAL_STATUSES },
        });

        if (active) {
          return res.status(400).json({
            success: false,
            message:
              "You have orders in progress. Wait for them to finish first.",
          });
        }

        await deleteFromCloudinary(customer.profileImage?.publicId);
        customer.profileImage = { url: null, publicId: null };
        customer.addresses = [];
        customer.cart = [];
        customer.wishlist = [];
        await customer.save();
      }
    }

    if (user.role === "farmer") {
      const farmer = await Farmer.findOne({ user: user._id }).populate("farms");

      if (farmer) {
        for (const farm of farmer.farms) {
          if (await farmHasActiveWork(farm._id)) {
            return res.status(400).json({
              success: false,
              message: `${farm.name} has orders or company sales in progress`,
            });
          }
        }

        for (const farm of farmer.farms) {
          await deleteFarmCascade(farm);
        }

        await deleteFromCloudinary(farmer.profileImage?.publicId);
        farmer.profileImage = { url: null, publicId: null };
        farmer.farms = [];
        await farmer.save();
      }
    }

    // Anonymize instead of deleting so orders/reviews/revenue keep valid references
    await Notification.deleteMany({ recipient: user._id });

    user.name = "Deleted User";
    user.email = `deleted-${user._id}@deleted.invalid`;
    user.phone = undefined;
    user.password = await bcrypt.hash(
      crypto.randomBytes(32).toString("hex"),
      10,
    );
    user.isActive = false;
    user.verificationOTP = null;
    user.verificationOTPExpireAt = null;
    user.passwordResetOTP = null;
    user.passwordResetOTPExpireAt = null;
    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendVerificationOtp = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.verificationOTP = otp;
    user.verificationOTPExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your FreshMart account",
      html: verificationOtpEmail({ name: user.name, otp, minutes: 10 }),
    });

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (
      user.verificationOTP !== String(otp) ||
      !user.verificationOTPExpireAt ||
      user.verificationOTPExpireAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        isAccountVerified: true,
      },
      $unset: {
        verificationOTP: "",
        verificationOTPExpireAt: "",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -passwordResetOTP -passwordResetOTPExpireAt -verificationOTP -verificationOTPExpireAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      isLoggedIn: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset code has been sent",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpireAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log("ABOUT TO SEND EMAIL");
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset your FreshMart password",
      html: resetPasswordOtpEmail({ name: user.name, otp, minutes: 10 }),
    });
    console.log("EMAIL SENT:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (
      user.passwordResetOTP !== String(otp) ||
      !user.passwordResetOTPExpireAt ||
      user.passwordResetOTPExpireAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.passwordResetOTP = null;
    user.passwordResetOTPExpireAt = null;
    await user.save();

    const resetToken = jwt.sign(
      {
        userId: user._id,
        purpose: "passwordReset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.purpose !== "passwordReset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
    user.passwordResetOTP = null;
    user.passwordResetOTPExpireAt = null;

    await user.save();

    // If this was a change from a live session, keep this device logged in
    try {
      const current = jwt.verify(req.cookies?.token, process.env.JWT_SECRET);

      if (String(current.userId) === String(user._id)) {
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }
    } catch {
      // no live session: nothing to refresh
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
