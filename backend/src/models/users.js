import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "farmer", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verificationOTP: {
      type: String,
      default: null,
    },

    verificationOTPExpireAt: {
      type: Date,
      default: null,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetOTP: {
      type: String,
      default: null,
    },

    passwordResetOTPExpireAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
