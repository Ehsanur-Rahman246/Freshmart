import Product from "../models/product.js";
import Farmer from "../models/farmer.js";
import Farm from "../models/farm.js";

export const createProduct = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const {
      farmId,
      name,
      description,
      images,
      category,
      subCategory,
      season,
      source,
      price,
      unit,
      stock,
      discountPercentage,
      listingDuration,
    } = req.body;

    if (
      !farmId ||
      !name ||
      !category ||
      !subCategory ||
      !season ||
      !source ||
      price === undefined ||
      !unit ||
      stock === undefined ||
      listingDuration === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required product fields must be provided",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      farmer: farmer._id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found or you are not authorized to use this farm",
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + listingDuration);

    const product = await Product.create({
      farmer: farmer._id,
      farm: farm._id,

      name,
      description,
      images,

      category,
      subCategory,
      season,
      source,

      price,
      unit,
      stock,
      discountPercentage,

      listingDuration,
      expiresAt,

      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
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

export const getMyProducts = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const products = await Product.find({
      farmer: farmer._id,
    }).populate("farm", "name");

    return res.status(200).json({
      success: true,
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

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate({
        path: "farm",
        select: "name location images",
      })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: {
          path: "user",
          select: "name",
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
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

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "active",
    })
      .populate("farm", "name")
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: {
          path: "user",
          select: "name",
        },
      });

    return res.status(200).json({
      success: true,
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

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

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
        message: "Product not found or you are not authorized to update it",
      });
    }

    const {
      farmId,
      name,
      description,
      images,
      category,
      subCategory,
      season,
      source,
      price,
      unit,
      stock,
      discountPercentage,
    } = req.body;

    if (farmId !== undefined) {
      const farm = await Farm.findOne({
        _id: farmId,
        farmer: farmer._id,
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found or you are not authorized to use this farm",
        });
      }

      product.farm = farm._id;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = images;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (season !== undefined) product.season = season;
    if (source !== undefined) product.source = source;
    if (price !== undefined) product.price = price;
    if (unit !== undefined) product.unit = unit;
    if (stock !== undefined) product.stock = stock;

    if (discountPercentage !== undefined) {
      product.discountPercentage = discountPercentage;
    }
    
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
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

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

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
        message: "Product not found or you are not authorized to delete it",
      });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
