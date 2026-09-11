import User from "../models/User.js";
import createNotification from "./createNotification.js";

const notifyAdmin = async ({
  type,
  title,
  message,
  relatedOrder = null,
  relatedProduct = null,
}) => {
  const admin = await User.findOne({ role: "admin" }).select("_id");

  if (!admin) return;

  await createNotification({
    recipient: admin._id,
    recipientRole: "admin",
    type,
    title,
    message,
    relatedOrder,
    relatedProduct,
  });
};

export default notifyAdmin;