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
        "orderAccepted",
        "orderRejected",
        "orderCancelled",
        "orderProcessing",
        "readyForPickup",
        "paymentRequired",
        "driverAssigned",
        "pickedUp",
        "toOriginCenter",
        "inTransit",
        "toDestinationCenter",
        "outForDelivery",
        "delivered",
        "paymentSuccess",
        "paymentFailed",
        "productExpired",
        "reviewReceived",
        "newCustomerRegistered",
        "newFarmerRegistered",
        "reviewReported",
        "productAdded",
        "companySaleReady",
        "companySaleOfferAccepted",
        "companySalePickedUp",
        "companySaleFinalized",
        "newMessage",
        "conversationReported",
      ],
      required: true,
    },

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

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
    
    relatedReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90-day TTL,

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
