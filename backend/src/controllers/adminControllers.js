import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Revenue from "../models/Revenue.js";
import { recordCompanySaleRevenue } from "../utils/recordRevenue.js";
import { notifyFarmerOfProduct } from "../utils/notifyFarmer.js";
import { APP_TIMEZONE, APP_TZ_OFFSET_MS } from "../config/time.js";
import { round2, roundTotals } from "../utils/money.js";
import mongoose from "mongoose";

const ORDER_STATUSES = [
  "pendingAcceptance",
  "orderPlaced",
  "paymentPending",
  "processing",
  "rejected",
  "readyForPickup",
  "pickedUp",
  "toOriginCenter",
  "inTransit",
  "toDestinationCenter",
  "outForDelivery",
  "delivered",
  "cancelled",
];

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalFarmers,
      totalFarms,
      totalOrders,
      statusCounts,
    ] = await Promise.all([
      Customer.countDocuments(),
      Farmer.countDocuments(),
      Farm.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const statusMap = new Map(statusCounts.map((s) => [s._id, s.count]));
    const ordersByStatus = Object.fromEntries(
      ORDER_STATUSES.map((s) => [s, statusMap.get(s) || 0]),
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalFarmers,
        totalFarms,
        totalOrders,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// AFTER
const DEFAULT_COMPANY_SALE_STAGES = ["readyForPickup", "pickedUp"];
const ALL_COMPANY_SALE_STAGES = [
  "awaitingFarmerResponse",
  "processing",
  "readyForPickup",
  "pickedUp",
  "sold",
  "rejected",
];

export const getCompanySaleQueue = async (req, res) => {
  try {
    const raw = String(req.query.stage || "").trim();
    let stages = DEFAULT_COMPANY_SALE_STAGES;

    if (raw === "all") {
      stages = ALL_COMPANY_SALE_STAGES;
    } else if (raw) {
      const requested = raw.split(",").map((s) => s.trim());
      if (!requested.every((s) => ALL_COMPANY_SALE_STAGES.includes(s))) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid stage" });
      }
      stages = requested;
    }

    const products = await Product.find({
      companySaleStage: { $in: stages },
    })
      .populate({
        path: "farmer",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .populate("farm", "name")
      .sort({ updatedAt: 1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markCompanySalePickedUp = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.companySaleStage !== "readyForPickup") {
      return res.status(400).json({
        success: false,
        message: "This listing is not ready for pickup",
      });
    }

    product.companySaleStage = "pickedUp";

    await product.save();

    await notifyFarmerOfProduct(product, {
      type: "companySalePickedUp",
      title: "Company Sale Picked Up",
      message: `${product.name} was picked up. Payment is being finalized.`,
    });

    return res.status(200).json({
      success: true,
      message: "Listing marked as picked up",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const finalizeCompanySale = async (req, res) => {
  try {
    const { productId } = req.params;
    const { company } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.companySaleStage !== "pickedUp") {
      return res.status(400).json({
        success: false,
        message: "This listing has not been picked up yet",
      });
    }

    const quantitySold = product.stock;

    product.companySaleStage = "sold";
    product.status = "soldToCompany";
    product.company = company.trim();
    product.soldToCompanyAt = new Date();
    product.stock = 0;

    await product.save();
    await recordCompanySaleRevenue(product, quantitySold);

    await notifyFarmerOfProduct(product, {
      type: "companySaleFinalized",
      title: "Company Sale Completed",
      message: `${product.name} was sold to ${product.company}.`,
    });

    return res.status(200).json({
      success: true,
      message: "Company sale finalized",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// REVENUE

export const getAdminRevenueSummary = async (req, res) => {
  try {
    const [totals] = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          totalAdminRevenue: { $sum: "$adminRevenue" },
          totalFarmerRevenue: { $sum: "$farmerRevenue" },
          totalGross: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const [byType] = await Promise.all([
      Revenue.aggregate([
        {
          $group: {
            _id: "$type",
            adminRevenue: { $sum: "$adminRevenue" },
            farmerRevenue: { $sum: "$farmerRevenue" },
            grossAmount: { $sum: "$grossAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      summary: totals
        ? roundTotals(totals)
        : {
            totalAdminRevenue: 0,
            totalFarmerRevenue: 0,
            totalGross: 0,
            count: 0,
          },
      byType: byType.map(roundTotals),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFarmRevenue = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid farm ID" });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const [totals] = await Revenue.aggregate([
      { $match: { farm: farm._id } },
      {
        $group: {
          _id: null,
          totalFarmerRevenue: { $sum: "$farmerRevenue" },
          totalAdminRevenue: { $sum: "$adminRevenue" },
          totalGross: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const entries = await Revenue.find({ farm: farm._id })
      .populate("order", "orderNumber")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      summary: totals
        ? roundTotals(totals)
        : {
            totalFarmerRevenue: 0,
            totalAdminRevenue: 0,
            totalGross: 0,
            count: 0,
          },
      entries,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRevenueOverTime = async (req, res) => {
  try {
    // "now" as a Dhaka wall-clock date, read with UTC getters
    const local = new Date(Date.now() + APP_TZ_OFFSET_MS);
    const y = local.getUTCFullYear();
    const m = local.getUTCMonth();
    const d = local.getUTCDate();

    // real instants for the start of the first daily / monthly bucket
    const dailyStart = new Date(Date.UTC(y, m, d - 29) - APP_TZ_OFFSET_MS);
    const monthlyStart = new Date(Date.UTC(y, m - 11, 1) - APP_TZ_OFFSET_MS);

    const group = (format, since) =>
      Revenue.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format,
                date: "$createdAt",
                timezone: APP_TIMEZONE,
              },
            },
            totalSales: { $sum: "$grossAmount" },
            adminRevenue: { $sum: "$adminRevenue" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    const [dailyRaw, monthlyRaw] = await Promise.all([
      group("%Y-%m-%d", dailyStart),
      group("%Y-%m", monthlyStart),
    ]);

    const dailyMap = new Map(dailyRaw.map((r) => [r._id, r]));
    const daily = Array.from({ length: 30 }, (_, i) => {
      const key = new Date(Date.UTC(y, m, d - 29 + i))
        .toISOString()
        .slice(0, 10);
      const entry = dailyMap.get(key);

      return {
        date: key,
        totalSales: round2(entry?.totalSales),
        adminRevenue: round2(entry?.adminRevenue),
        count: entry?.count || 0,
      };
    });

    const monthlyMap = new Map(monthlyRaw.map((r) => [r._id, r]));
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const dt = new Date(Date.UTC(y, m - 11 + i, 1));
      const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);

      return {
        month: key,
        totalSales: round2(entry?.totalSales),
        adminRevenue: round2(entry?.adminRevenue),
      };
    });

    return res.status(200).json({ success: true, daily, monthly });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const filter = {};

    if (status) {
      if (!Product.schema.path("status").enumValues.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
      filter.status = status;
    }

    const products = await Product.find(filter)
      .populate("farm", "name")
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
