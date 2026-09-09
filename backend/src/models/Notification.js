import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipientRole: {
      type: String,
      enum: ["customer", "farmer", "admin"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "orderPlaced",
        "orderCancelled",
        "orderProcessing",
        "readyForPickup",
        "toOriginCenter",
        "inTransit",
        "outForDelivery",
        "delivered",
        "paymentSuccess",
        "paymentFailed",
        "productExpired",
        "reviewReceived",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
