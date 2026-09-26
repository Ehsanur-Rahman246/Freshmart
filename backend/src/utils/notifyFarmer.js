import Farmer from "../models/Farmer.js";
import createNotification from "./createNotification.js";

export const notifyFarmerOfProduct = async (
  product,
  { type, title, message },
) => {
  const farmer = await Farmer.findById(product.farmer).select("user");
  if (!farmer) return;

  await createNotification({
    recipient: farmer.user,
    recipientRole: "farmer",
    type,
    title,
    message,
    relatedProduct: product._id,
  });
};

export const notifyFarmer = async (
  farmerId,
  {
    type,
    title,
    message,
    relatedOrder = null,
    relatedProduct = null,
    relatedReview = null,
  },
) => {
  const farmer = await Farmer.findById(farmerId).select("user");
  if (!farmer) return;

  await createNotification({
    recipient: farmer.user,
    recipientRole: "farmer",
    type,
    title,
    message,
    relatedOrder,
    relatedProduct,
    relatedReview,
  });
};
