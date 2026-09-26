import Notification from "../models/Notification.js";
import { emitToUser } from "./realtime.js";

const createNotification = async ({
  recipient,
  recipientRole,
  type,
  title,
  message,
  relatedOrder = null,
  relatedProduct = null,
  relatedReview = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      recipientRole,
      type,
      title,
      message,
      relatedOrder,
      relatedProduct,
      relatedReview,
    });

    emitToUser(recipient, "notification:new", notification);

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error);
    return null;
  }
};

export default createNotification;
