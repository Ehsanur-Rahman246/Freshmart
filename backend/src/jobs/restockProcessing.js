import cron from "node-cron";
import Product from "../models/Product.js";
import { CRON_INTERVAL } from "../config/time.js";
import { processExpiredProduct } from "./demoFarmerAutomation.js";

const applyMaturedRestocks = async () => {
  const now = new Date();

  const products = await Product.find({
    pendingRestocks: { $elemMatch: { availableAt: { $lte: now } } },
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

    const isDemo = product.farmer?.isDemo === true;
    const reactivatable = ["soldOut", "active", "soldToCompany"].includes(
      product.status,
    );

    if (isDemo && reactivatable) {
      if (product.expiresAt <= now) {
        await processExpiredProduct(product); // saves internally
        continue;
      }
      product.status = "active";
    }

    await product.save();
  }
};

export const startRestockProcessingScheduler = () => {
  let isRunning = false;

  cron.schedule(CRON_INTERVAL, async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      await applyMaturedRestocks();
    } catch (error) {
      console.error("Restock processing error:", error);
    } finally {
      isRunning = false;
    }
  });

  console.log("Restock processing scheduler started");
};
