import Product from "../models/Product.js";
import { HOUR_IN_MS, RESTOCK_DELAY_HOURS } from "../config/time.js";

// Called for each cancelled/rejected order line item. Doesn't restock
// immediately — queues the quantity to return after RESTOCK_DELAY_HOURS
// (simulated), regardless of what stage the order was cancelled at.
const scheduleRestock = async (productId, quantity) => {
  const availableAt = new Date(Date.now() + RESTOCK_DELAY_HOURS * HOUR_IN_MS);

  const product = await Product.findByIdAndUpdate(
    productId,
    { $push: { pendingRestocks: { quantity, availableAt } } },
    { new: true },
  );

  // If this was the last of the stock, mark it soldOut right away rather
  // than waiting for the periodic sweep to notice stock === 0.
  if (product && product.stock === 0 && product.status === "active") {
    product.status = "soldOut";
    await product.save();
  }
};

export default scheduleRestock;