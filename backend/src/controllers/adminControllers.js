import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Revenue from "../models/Revenue.js";
import { recordCompanySaleRevenue } from "../utils/recordRevenue.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalFarmers,
      totalFarms,
      totalOrders,
      pendingAcceptance,
      processing,
      readyForPickup,
      pickedUp,
      delivered,
      rejected,
      cancelled,
    ] = await Promise.all([
      Customer.countDocuments(),
      Farmer.countDocuments(),
      Farm.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pendingAcceptance" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "readyForPickup" }),
      Order.countDocuments({ status: "pickedUp" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "rejected" }),
      Order.countDocuments({ status: "cancelled" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalFarmers,
        totalFarms,
        totalOrders,
        ordersByStatus: {
          pendingAcceptance,
          processing,
          readyForPickup,
          pickedUp,
          delivered,
          rejected,
          cancelled,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCompanySaleQueue = async (req, res) => {
  try {
    const products = await Product.find({
      companySaleStage: { $in: ["readyForPickup", "pickedUp"] },
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

    await product.save();
    await recordCompanySaleRevenue(product, quantitySold);

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
      summary: totals || {
        totalAdminRevenue: 0,
        totalFarmerRevenue: 0,
        totalGross: 0,
        count: 0,
      },
      byType,
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
      summary: totals || {
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