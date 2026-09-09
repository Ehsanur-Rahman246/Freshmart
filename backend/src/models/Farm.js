import mongoose from "mongoose";

const farmSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
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

    isActive: {
      type: Boolean,
      default: true,
    },

    establishedYear: {
      type: Number,
      default: null,
    },

    size: {
      value: {
        type: Number,
        required: true,
      },

      unit: {
        type: String,
        enum: ["acre", "hectare", "decimal"],
        required: true,
      },
    },

    location: {
      district: {
        type: String,
        required: true,
        trim: true,
      },

      upazila: {
        type: String,
        required: true,
        trim: true,
      },

      village: {
        type: String,
        required: true,
        trim: true,
      },
    },

    farmType: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    products: {
      allYear: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      winter: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      summer: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      monsoon: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const Farm = mongoose.model("Farm", farmSchema);

export default Farm;
