import cron from "node-cron";
import Product from "../models/Product.js";
import { CRON_INTERVAL } from "../config/time.js";

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
    const reactivatable =
      ["soldOut", "active"].includes(product.status) ||
      (isDemo && product.status === "soldToCompany");

    if (reactivatable) {
      // expired ones are picked up by handleExpiredProducts on the next tick
      product.status = "active";
      product.nextRestockAt = null;
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
