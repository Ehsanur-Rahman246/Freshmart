import User from "../models/User.js";
import createNotification from "./createNotification.js";

const notifyAdmin = async ({
  type, title, message,
  relatedOrder = null,
  relatedProduct = null,
  relatedReview = null,
}) => {
  const admins = await User.find({ role: "admin", isActive: true }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipient: admin._id,
        recipientRole: "admin",
        type, title, message,
        relatedOrder, relatedProduct, relatedReview,
      }),
    ),
  );
};

export default notifyAdmin;
