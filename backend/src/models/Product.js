import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      required: true,
      enum: [
        "dairy",
        "grain",
        "spices",
        "poultry",
        "livestock",
        "fruits",
        "vegetables",
      ],
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    season: {
      type: String,
      required: true,
      enum: ["allYear", "winter", "summer", "monsoon"],
    },

    source: {
      type: String,
      required: true,
      enum: [
        "field",
        "greenhouse",
        "orchard",
        "dairyFarm",
        "poultryFarm",
        "livestockFarm",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "L", "pc", "dozen", "mL"],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    listingDuration: {
      type: Number,
      required: true,
      min: 1,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "soldOut",
        "expired",
        "inTransfer",
        "soldToCompany",
        "inactive",
      ],
      default: "active",
    },

    company: {
      type: String,
      default: null,
    },

    soldToCompanyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
