import cron from "node-cron";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Farm from "../models/Farm.js";
import { placeDemoOrder } from "../controllers/orderControllers.js";
import { DEMO_CUSTOMER_CRON_INTERVAL } from "../config/time.js";
import {
  DEMO_CUSTOMERS_ACTIVE_PER_DAY,
  DEMO_WISHLIST_DAILY_ADD_MIN,
  DEMO_WISHLIST_DAILY_ADD_MAX,
  DEMO_CART_FARM_PRODUCT_COUNT,
  DEMO_CART_PRODUCT_QTY_MIN,
  DEMO_CART_PRODUCT_QTY_MAX,
} from "../config/business.js";

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Adds DEMO_WISHLIST_DAILY_ADD_MIN..MAX random active products (not already
// wishlisted) to the customer's wishlist.
const restockWishlist = async (customer) => {
  const addCount = randomInt(
    DEMO_WISHLIST_DAILY_ADD_MIN,
    DEMO_WISHLIST_DAILY_ADD_MAX,
  );

  const candidates = await Product.aggregate([
    {
      $match: {
        status: "active",
        expiresAt: { $gt: new Date() },
        _id: { $nin: customer.wishlist },
      },
    },
    { $sample: { size: addCount } },
  ]);

  if (candidates.length > 0) {
    customer.wishlist.push(...candidates.map((p) => p._id));
    await customer.save();
  }
};

// Tries to add exactly 1 available wishlist item to the cart. Skips
// silently if none of the wishlisted products are currently available.
const addWishlistItemToCart = async (customer) => {
  if (customer.wishlist.length === 0) return;

  const shuffledWishlist = [...customer.wishlist].sort(
    () => 0.5 - Math.random(),
  );

  for (const productId of shuffledWishlist) {
    const product = await Product.findOne({
      _id: productId,
      status: "active",
      expiresAt: { $gt: new Date() },
      stock: { $gt: 0 },
    });

    if (!product) continue;

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === product._id.toString(),
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      customer.cart.push({ product: product._id, quantity: 1 });
    }

    await customer.save();
    return;
  }
};

// Picks 1 random farm with at least one active product, then adds
// DEMO_CART_FARM_PRODUCT_COUNT of its products to the cart, each at a
// random quantity capped by available stock.
const addRandomFarmItemsToCart = async (customer) => {
  const farmIds = await Product.distinct("farm", {
    status: "active",
    expiresAt: { $gt: new Date() },
    stock: { $gt: 0 },
  });

  if (farmIds.length === 0) return;

  const randomFarmId = farmIds[Math.floor(Math.random() * farmIds.length)];

  const farmProducts = await Product.find({
    farm: randomFarmId,
    status: "active",
    expiresAt: { $gt: new Date() },
    stock: { $gt: 0 },
  });

  if (farmProducts.length === 0) return;

  const chosenProducts = pickRandom(
    farmProducts,
    Math.min(DEMO_CART_FARM_PRODUCT_COUNT, farmProducts.length),
  );

  for (const product of chosenProducts) {
    const rawQty = randomInt(DEMO_CART_PRODUCT_QTY_MIN, DEMO_CART_PRODUCT_QTY_MAX);
    const quantity = Math.min(rawQty, product.stock);

    if (quantity <= 0) continue;

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === product._id.toString(),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      customer.cart.push({ product: product._id, quantity });
    }
  }

  await customer.save();
};

const runDemoCustomerForToday = async (customer) => {
  await restockWishlist(customer);
  await addWishlistItemToCart(customer);
  await addRandomFarmItemsToCart(customer);

  const refreshedCustomer = await Customer.findById(customer._id);

  if (refreshedCustomer.cart.length === 0) return;

  const defaultAddress =
    refreshedCustomer.addresses.find((a) => a.isDefault) ||
    refreshedCustomer.addresses[0];

  if (!defaultAddress) return;

  await placeDemoOrder({
    userId: customer.user,
    addressId: defaultAddress._id.toString(),
    paymentMethod: "cashOnDelivery",
    pointsToRedeem: 0,
  });
};

const runDemoCustomerAutomation = async () => {
  const demoCustomers = await Customer.find({ isDemo: true });

  if (demoCustomers.length === 0) return;

  const activeCount = Math.min(
    DEMO_CUSTOMERS_ACTIVE_PER_DAY,
    demoCustomers.length,
  );

  const chosenCustomers = pickRandom(demoCustomers, activeCount);

  for (const customer of chosenCustomers) {
    try {
      await runDemoCustomerForToday(customer);
    } catch (error) {
      console.error(
        `Demo customer automation failed for customer ${customer._id}:`,
        error,
      );
    }
  }
};

export const startDemoCustomerScheduler = () => {
  cron.schedule(DEMO_CUSTOMER_CRON_INTERVAL, async () => {
    try {
      await runDemoCustomerAutomation();
    } catch (error) {
      console.error("Demo customer automation error:", error);
    }
  });

  console.log("Demo customer automation scheduler started");
};