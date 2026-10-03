import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import pLimit from "p-limit";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";
import notifyAdmin from "../utils/notifyAdmin.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import {
  TERMINAL_STATUSES,
  ACTIVE_COMPANY_SALE_STAGES,
} from "../utils/refundPolicy.js";
import mongoose from "mongoose";
import {
  validateProductInput,
  PRODUCT_ENUMS,
} from "../utils/productValidation.js";
import { parseRemoveImages, MAX_IMAGES } from "../utils/imageHelpers.js";
import { getInactiveFarmIds } from "../utils/farmVisibility.js";
import { canManageFarmerData } from "../utils/access.js";
import { getRangeForName } from "../utils/pricingRange.js";

const IMAGE_UPLOAD_CONCURRENCY = 4;
const PUBLIC_STATUSES = ["active", "soldOut"];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const createProduct = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user.userId });

    if (!farmer) {
      return res
        .status(404)
        .json({ success: false, message: "Farmer profile not found" });
    }

    const { farmId } = req.body;

    if (!farmId || !mongoose.Types.ObjectId.isValid(farmId)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid farm is required" });
    }

    const { error, value } = validateProductInput(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const range = await getRangeForName(value.name);
    if (range && (value.price < range.min || value.price > range.max)) {
      return res.status(400).json({
        success: false,
        message: `Price for "${value.name}" must be between ${range.min} and ${range.max}`,
      });
    }

    const farm = await Farm.findOne({ _id: farmId, farmer: farmer._id });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found or you are not authorized to use this farm",
      });
    }

    if (!farm.isActive) {
      return res.status(400).json({
        success: false,
        message: "This farm is inactive. Activate it before listing products",
      });
    }

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
      ...value,
      discountPercentage: value.discountPercentage ?? 0,
      images,
      expiresAt: daysFromNow(value.listingDuration),
      status: "active",
    });

    farm.products[value.season].push(product._id);
    await farm.save();

    await notifyAdmin({
      type: "productAdded",
      title: "New Product Listed",
      message: `${farm.name} listed a new product: ${product.name}.`,
      relatedProduct: product._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

    const filter = { farmer: farmer._id };

    if (req.query.farm && mongoose.Types.ObjectId.isValid(req.query.farm)) {
      filter.farm = req.query.farm;
    }

    const products = await Product.find(filter).populate("farm", "name");

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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId)
      .populate({ path: "farm", select: "name location images isActive" })
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name" },
      });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const isPublic =
      PUBLIC_STATUSES.includes(product.status) &&
      product.farm?.isActive !== false;

    if (!isPublic && !(await canManageFarmerData(req.user, product.farmer))) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "")
      .trim()
      .slice(0, 50);
    const category = String(req.query.category || "").trim();
    const farmId = String(req.query.farm || "").trim();

    const emptyResult = { success: true, products: [], page, totalPages: 1 };
    const inactiveFarmIds = await getInactiveFarmIds();
    const filter = { status: "active" };

    if (category) {
      if (!PRODUCT_ENUMS.category.includes(category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      }
      filter.category = category;
    }

    if (farmId) {
      if (!mongoose.Types.ObjectId.isValid(farmId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid farm ID" });
      }
      if (inactiveFarmIds.some((id) => id.toString() === farmId)) {
        return res.status(200).json(emptyResult);
      }
      filter.farm = farmId;
    } else if (inactiveFarmIds.length > 0) {
      filter.farm = { $nin: inactiveFarmIds };
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const matchingFarmIds = await Farm.find({
        name: regex,
        isActive: true,
      }).select("_id");

      filter.$or = [
        { name: regex },
        { category: regex },
        { subCategory: regex },
        { farm: { $in: matchingFarmIds.map((f) => f._id) } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("farm", "name")
        .populate({
          path: "farmer",
          select: "profileImage",
          populate: { path: "user", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const farmer = await Farmer.findOne({ user: req.user.userId });

    if (!farmer) {
      return res
        .status(404)
        .json({ success: false, message: "Farmer profile not found" });
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

    if (ACTIVE_COMPANY_SALE_STAGES.includes(product.companySaleStage)) {
      return res.status(400).json({
        success: false,
        message:
          "This listing is part of a company sale in progress and can't be edited right now",
      });
    }

    const { farmId, removeImages } = req.body;
    const { error, value } = validateProductInput(req.body, { partial: true });

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const removeIds = parseRemoveImages(removeImages, product.images);
    const incoming = req.files?.length || 0;

    if (product.images.length - removeIds.length + incoming > MAX_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `A product can have at most ${MAX_IMAGES} images`,
      });
    }

    const oldFarmId = product.farm.toString();
    const oldSeason = product.season;
    let newFarm = null;

    if (farmId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(farmId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid farm ID" });
      }

      const farm = await Farm.findOne({ _id: farmId, farmer: farmer._id });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found or you are not authorized to use this farm",
        });
      }

      if (farm._id.toString() !== oldFarmId) {
        if (!farm.isActive) {
          return res.status(400).json({
            success: false,
            message: "You can't move a listing to an inactive farm",
          });
        }
        newFarm = farm;
        product.farm = farm._id;
      }
    }

    const { listingDuration, ...fields } = value;
    Object.assign(product, fields);
    const range = await getRangeForName(product.name);
    if (range && (product.price < range.min || product.price > range.max)) {
      return res.status(400).json({
        success: false,
        message: `Price for "${product.name}" must be between ${range.min} and ${range.max}`,
      });
    }

    // Only restart the listing clock when the duration actually changed
    if (
      listingDuration !== undefined &&
      listingDuration !== product.listingDuration
    ) {
      product.listingDuration = listingDuration;
      product.expiresAt = daysFromNow(listingDuration);
    }

    if (removeIds.length > 0) {
      await Promise.all(removeIds.map((id) => deleteFromCloudinary(id)));
      product.images = product.images.filter(
        (img) => !removeIds.includes(img.publicId),
      );
    }

    if (incoming > 0) {
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

    if (
      product.stock > 0 &&
      ["soldOut", "soldToCompany", "inactive"].includes(product.status)
    ) {
      product.status = "active";
      product.nextRestockAt = null;
      product.companySaleStage = "none";
      product.companySalePrice = null;

      // relisting an already-expired product: give it a fresh window
      if (product.expiresAt <= new Date()) {
        product.expiresAt = daysFromNow(product.listingDuration);
      }
    }

    await product.save();

    const newFarmId = product.farm.toString();
    const newSeason = product.season;

    if (newFarmId !== oldFarmId || newSeason !== oldSeason) {
      if (newFarmId !== oldFarmId) {
        const oldFarm = await Farm.findById(oldFarmId);

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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
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
        message: "Product not found or you are not authorized to delete it",
      });
    }

    const inProgress =
      (await Order.exists({
        "items.product": product._id,
        status: { $nin: TERMINAL_STATUSES },
      })) || ACTIVE_COMPANY_SALE_STAGES.includes(product.companySaleStage);

    if (inProgress) {
      return res.status(400).json({
        success: false,
        message: "This product has orders or a company sale in progress",
      });
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => deleteFromCloudinary(img.publicId)),
      );
    }

    await Product.findByIdAndDelete(productId);
    await Customer.updateMany(
      {},
      { $pull: { cart: { product: product._id }, wishlist: product._id } },
    );

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

export const getRelatedProducts = async (req, res) => {
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

    const inactiveFarmIds = await getInactiveFarmIds();
    const productFarmInactive = inactiveFarmIds.some(
      (id) => id.toString() === product.farm.toString(),
    );

    const farmProducts = productFarmInactive
      ? []
      : await Product.find({
          _id: { $ne: product._id },
          farm: product.farm,
          status: "active",
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .populate("farm", "name")
          .populate({
            path: "farmer",
            select: "profileImage",
            populate: { path: "user", select: "name" },
          });

    const excludeIds = [product._id, ...farmProducts.map((p) => p._id)];

    const categoryProducts = await Product.find({
      _id: { $nin: excludeIds },
      farm: { $nin: inactiveFarmIds },
      category: product.category,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("farm", "name")
      .populate({
        path: "farmer",
        select: "profileImage",
        populate: { path: "user", select: "name" },
      });

    let related = [...farmProducts, ...categoryProducts];

    // Backfill if either bucket came up short
    if (related.length < 4) {
      const backfillExcludeIds = [product._id, ...related.map((p) => p._id)];

      const backfill = await Product.find({
        _id: { $nin: backfillExcludeIds },
        farm: { $nin: inactiveFarmIds },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .limit(4 - related.length)
        .populate("farm", "name")
        .populate({
          path: "farmer",
          select: "profileImage",
          populate: { path: "user", select: "name" },
        });

      related = [...related, ...backfill];
    }

    return res.status(200).json({
      success: true,
      products: related,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchProductNames = async (req, res) => {
  try {
    const search = String(req.query.q || "")
      .trim()
      .slice(0, 50);

    if (!search) {
      return res.status(200).json({ success: true, results: [] });
    }

    const regex = new RegExp(escapeRegex(search), "i");

    const results = await Product.aggregate([
      { $match: { name: regex, status: { $in: ["active", "soldOut"] } } },
      {
        $group: {
          _id: { $toLower: "$name" },
          name: { $first: "$name" },
          category: { $first: "$category" },
          unit: { $first: "$unit" },
          min: { $min: "$price" },
          max: { $max: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      results: results.map((r) => ({
        name: r.name,
        category: r.category,
        unit: r.unit,
        min: r.min,
        max: r.max,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
