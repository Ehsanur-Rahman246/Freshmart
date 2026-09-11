import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import pLimit from "p-limit";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

const IMAGE_UPLOAD_CONCURRENCY = 3;

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
    expiresAt.setDate(expiresAt.getDate() + Number(listingDuration));

    let images = [];

    if (req.files && req.files.length > 0) {
      const limit = pLimit(IMAGE_UPLOAD_CONCURRENCY);

      images = await Promise.all(
        req.files.map((file) =>
          limit(() =>
            uploadBufferToCloudinary(file.buffer, "freshmart/products"),
          ),
        ),
      );
    }

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

    farm.products[season].push(product._id);
    await farm.save();

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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ status: "active" })
        .populate("farm", "name")
        .populate({
          path: "farmer",
          select: "profileImage",
          populate: { path: "user", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ status: "active" }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
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
        message: "Product not found or you are not authorized to update it",
      });
    }

    const {
      farmId,
      name,
      description,
      category,
      subCategory,
      season,
      source,
      price,
      unit,
      stock,
      discountPercentage,
      removeImages,
    } = req.body;

    // Snapshot the "before" state so we know what to remove from Farm.products
    const oldFarmId = product.farm.toString();
    const oldSeason = product.season;

    let newFarm = null; // only set if farmId is actually changing

    if (farmId !== undefined) {
      const farm = await Farm.findOne({ _id: farmId, farmer: farmer._id });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found or you are not authorized to use this farm",
        });
      }

      if (farm._id.toString() !== oldFarmId) {
        newFarm = farm;
        product.farm = farm._id;
      }
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
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

    // Remove requested images (by publicId) from Cloudinary + the array
    if (removeImages) {
      let removeIds = [];

      try {
        removeIds =
          typeof removeImages === "string"
            ? JSON.parse(removeImages)
            : removeImages;
      } catch {
        removeIds = [];
      }

      if (Array.isArray(removeIds) && removeIds.length > 0) {
        await Promise.all(removeIds.map((id) => deleteFromCloudinary(id)));

        product.images = product.images.filter(
          (img) => !removeIds.includes(img.publicId),
        );
      }
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
      const limit = pLimit(IMAGE_UPLOAD_CONCURRENCY);

      const uploaded = await Promise.all(
        req.files.map((file) =>
          limit(() =>
            uploadBufferToCloudinary(file.buffer, "freshmart/products"),
          ),
        ),
      );

      product.images.push(...uploaded);
    }

    await product.save();

    const newFarmId = product.farm.toString();
    const newSeason = product.season;

    // Only touch Farm.products if the farm or season actually changed
    if (newFarmId !== oldFarmId || newSeason !== oldSeason) {
      const oldFarm = newFarm ? await Farm.findById(oldFarmId) : null;

      if (newFarmId !== oldFarmId) {
        if (oldFarm) {
          oldFarm.products[oldSeason].pull(product._id);
          await oldFarm.save();
        }

        newFarm.products[newSeason].push(product._id);
        await newFarm.save();
      } else {
        const farm = await Farm.findById(newFarmId);

        if (farm) {
          farm.products[oldSeason].pull(product._id);
          farm.products[newSeason].push(product._id);
          await farm.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
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
        message: "Product not found or you are not authorized to delete it",
      });
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => deleteFromCloudinary(img.publicId)),
      );
    }

    await Product.findByIdAndDelete(productId);

    const farm = await Farm.findById(product.farm);

    if (farm) {
      farm.products[product.season].pull(product._id);
      await farm.save();
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
