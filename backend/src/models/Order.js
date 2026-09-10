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

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

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
          name: { type: String, required: true, trim: true },
          price: { type: Number, required: true, min: 0 },
          quantity: { type: Number, required: true, min: 1 },
          unit: {
            type: String,
            required: true,
            enum: ["kg", "g", "L", "pc", "dozen", "mL"],
          },
          subtotal: { type: Number, required: true, min: 0 },
        },
      ],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    deliveryAddress: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      upazila: { type: String, required: true, trim: true },
      village: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },

    pricing: {
      itemsTotal: { type: Number, required: true, min: 0 },
      deliveryCharge: { type: Number, required: true, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      pointsRedeemed: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
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
      transactionId: { type: String, default: null },
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
      estimatedHours: { type: Number, required: true, min: 0 },
      estimatedDeliveryAt: { type: Date, required: true },
      courier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courier",
        default: null,
      },
      driver: {
        driverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Driver",
          default: null,
        },
        name: { type: String, default: null },
        phone: { type: String, default: null },
      },
      nextTransitionAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "pendingAcceptance",
        "paymentPending",
        "processing",
        "rejected",
        "readyForPickup",
        "pickedUp",
        "toOriginCenter",
        "inTransit",
        "toDestinationCenter",
        "outForDelivery",
        "delivered",
        "cancelled",
      ],
      default: "pendingAcceptance",
    },

    refund: {
      percentage: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // True when this order's farmer is a demo farmer — lets the demo
    // automation job find these orders without a populate on every sweep.
    isDemoOrder: {
      type: Boolean,
      default: false,
    },

    // When a demo order in "processing" should auto-advance to
    // readyForPickup. Null for real-farmer orders (they use acceptOrder/
    // updateOrderStatus instead).
    processingReadyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;