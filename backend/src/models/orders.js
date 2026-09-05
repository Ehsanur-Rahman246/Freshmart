import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    orderGroup: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // One order belongs to one farmer/farm origin
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

    items: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },

          name: {
            type: String,
            required: true,
            trim: true,
          },

          price: {
            type: Number,
            required: true,
            min: 0,
          },

          quantity: {
            type: Number,
            required: true,
            min: 1,
          },

          unit: {
            type: String,
            required: true,
            enum: ["kg", "g", "L", "pc", "dozen", "mL"],
          },

          subtotal: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Delivery address snapshot
    deliveryAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
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
    },

    pricing: {
      itemsTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      deliveryCharge: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    payment: {
      method: {
        type: String,
        required: true,
        enum: ["cashOnDelivery", "online"],
      },

      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },

      transactionId: {
        type: String,
        default: null,
      },
    },

    delivery: {
      originZone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
        required: true,
      },

      destinationZone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
        required: true,
      },

      estimatedHours: {
        type: Number,
        required: true,
        min: 0,
      },

      estimatedDeliveryAt: {
        type: Date,
        required: true,
      },

      courier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courier",
        default: null,
      },

      driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "processing",
        "readyForPickup",
        "toOriginCenter",
        "inTransit",
        "outForDelivery",
        "delivered",
        "cancelled",
      ],
      default: "processing",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
