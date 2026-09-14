import cron from "node-cron";
import Product from "../models/Product.js";
import { CRON_INTERVAL } from "../config/time.js";
import { processExpiredProduct } from "./demoFarmerAutomation.js";

const applyMaturedRestocks = async () => {
  const now = new Date();

  const products = await Product.find({
    pendingRestocks: { $elemMatch: { availableAt: { $lte: now } } },
    status: { $in: ["soldOut", "active"] }, // skip anything mid company-sale pipeline
  }).populate({
    path: "farmer",
    select: "isDemo user",
    populate: { path: "user", select: "name email" },
  });

  for (const product of products) {
    const dueEntries = product.pendingRestocks.filter(
      (entry) => entry.availableAt <= now,
    );
    const futureEntries = product.pendingRestocks.filter(
      (entry) => entry.availableAt > now,
    );

    if (dueEntries.length === 0) continue;

    const restoredQty = dueEntries.reduce((sum, e) => sum + e.quantity, 0);

    product.stock += restoredQty;
    product.pendingRestocks = futureEntries;

    if (product.expiresAt <= now) {
      await processExpiredProduct(product); // saves internally
      continue;
    }

    product.status = "active";
    await product.save();
  }
};

export const startRestockProcessingScheduler = () => {
  cron.schedule(CRON_INTERVAL, async () => {
    try {
      await applyMaturedRestocks();
    } catch (error) {
      console.error("Restock processing error:", error);
    }
  });

  console.log("Restock processing scheduler started");
};