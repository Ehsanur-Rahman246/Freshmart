import Farmer from "../models/Farmer.js";
import Product from "../models/Product.js";
import Revenue from "../models/Revenue.js";

export const getFarmerProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      user: req.user.userId,
    })
      .populate("user", "-password")
      .populate("farms");

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateFarmerProfile = async (req, res) => {
  try {
    const { profileImage } = req.body;

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    if (profileImage !== undefined) {
      farmer.profileImage = profileImage;
    }

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer profile updated successfully",
      farmer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const respondToCompanySaleOffer = async (req, res) => {
  try {
    const { productId } = req.params;
    const { accept } = req.body;

    if (typeof accept !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "accept (true or false) is required",
      });
    }

    const farmer = await Farmer.findOne({ user: req.user.userId });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      farmer: farmer._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.companySaleStage !== "awaitingFarmerResponse") {
      return res.status(400).json({
        success: false,
        message: "This offer is no longer awaiting a response",
      });
    }

    if (accept) {
      product.companySaleStage = "processing";
    } else {
      product.companySaleStage = "rejected";
      product.status = "inactive";
    }

    product.companySaleRespondBy = null;

    await product.save();

    return res.status(200).json({
      success: true,
      message: accept
        ? "Company sale offer accepted"
        : "Company sale offer rejected",
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

export const markCompanySaleReady = async (req, res) => {
  try {
    const { productId } = req.params;

    const farmer = await Farmer.findOne({ user: req.user.userId });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      farmer: farmer._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.companySaleStage !== "processing") {
      return res.status(400).json({
        success: false,
        message: "This listing is not currently in processing stage",
      });
    }

    product.companySaleStage = "readyForPickup";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Listing marked ready for pickup",
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

export const getMyRevenue = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user.userId });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const [totals] = await Revenue.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: null,
          totalFarmerRevenue: { $sum: "$farmerRevenue" },
          totalGross: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const byFarm = await Revenue.aggregate([
      { $match: { farmer: farmer._id } },
      {
        $group: {
          _id: "$farm",
          totalFarmerRevenue: { $sum: "$farmerRevenue" },
          totalGross: { $sum: "$grossAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      summary: totals || { totalFarmerRevenue: 0, totalGross: 0, count: 0 },
      byFarm,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};