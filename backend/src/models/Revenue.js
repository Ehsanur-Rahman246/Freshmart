import mongoose from "mongoose";

const revenueSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["sale", "companySale"],
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // null for companySale (not tied to a customer order)
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    adminRevenue: {
      type: Number,
      required: true,
      min: 0,
    },

    farmerRevenue: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  },
);

const Revenue = mongoose.model("Revenue", revenueSchema);

export default Revenue;
