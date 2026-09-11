import crypto from "crypto";
import Order from "../models/Order.js";

const generateOrderNumber = async () => {
  let orderNumber;

  do {
    orderNumber = `FM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  } while (await Order.exists({ orderNumber }));

  return orderNumber;
};

export default generateOrderNumber;