import Customer from "../models/Customer.js";
import createNotification from "./createNotification.js";

export const notifyCustomer = async (
  customerId,
  {
    type,
    title,
    message,
    relatedOrder = null,
    relatedProduct = null,
    relatedReview = null,
  },
) => {
  const customer = await Customer.findById(customerId).select("user");
  if (!customer) return;

  await createNotification({
    recipient: customer.user,
    recipientRole: "customer",
    type,
    title,
    message,
    relatedOrder,
    relatedProduct,
    relatedReview,
  });
};
