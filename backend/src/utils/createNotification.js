import Notification from "../models/Notification.js";

const createNotification = async ({
  recipient,
  recipientRole,
  type,
  title,
  message,
  relatedOrder = null,
  relatedProduct = null,
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
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error);

    return null;
  }
};

export default createNotification;
