import Product from "../models/Product.js";
import scheduleRestock from "./scheduleRestock.js";

const idOf = (p) => p?._id || p;

// items: [{ product: <doc or id>, quantity }]
// Atomic per item: never oversells. Rolls back on the first failure.
export const reserveStock = async (items) => {
  const reserved = [];

  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: idOf(item.product),
        status: "active",
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
    );

    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      return { ok: false, productName: item.product?.name };
    }

    reserved.push(item);
  }

  return { ok: true };
};

// Immediate return (pre-pickup cancel, reject, failed checkout)
export const releaseStock = async (items) => {
  for (const item of items) {
    const id = idOf(item.product);

    await Product.updateOne({ _id: id }, { $inc: { stock: item.quantity } });

    // soldOut -> active (expired ones get picked up by handleExpiredProducts)
    await Product.updateOne(
      { _id: id, status: "soldOut", stock: { $gt: 0 } },
      { $set: { status: "active", nextRestockAt: null } },
    );
  }
};

// Delayed return (goods were already picked up)
export const releaseStockDelayed = async (items) => {
  for (const item of items) {
    await scheduleRestock(idOf(item.product), item.quantity);
  }
};