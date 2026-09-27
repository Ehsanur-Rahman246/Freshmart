import Product from "../models/Product.js";
import { HOUR_IN_MS, RESTOCK_DELAY_HOURS } from "../config/time.js";

const scheduleRestock = async (productId, quantity) => {
  const availableAt = new Date(Date.now() + RESTOCK_DELAY_HOURS * HOUR_IN_MS);

  const product = await Product.findByIdAndUpdate(
    productId,
    { $push: { pendingRestocks: { quantity, availableAt } } },
    { new: true },
  );

  if (product && product.stock === 0 && product.status === "active") {
    product.status = "soldOut";
    await product.save();
  }
};

export default scheduleRestock;
