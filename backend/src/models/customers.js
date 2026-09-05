import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    trim: true,
    default: "Home",
  },

  recipientName: {
    type: String,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  division: {
    type: String,
    required: true,
    trim: true,
  },

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

  address: {
    type: String,
    required: true,
    trim: true,
  },

  isDefault: {
    type: Boolean,
    default: false,
  },
});

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
