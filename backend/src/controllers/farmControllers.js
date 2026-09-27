import Farm from "../models/Farm.js";
import Farmer from "../models/Farmer.js";
import pLimit from "p-limit";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";
import {
  farmHasActiveWork,
  deleteFarmCascade,
} from "../utils/cascadeDelete.js";
import mongoose from "mongoose";
import { canManageFarmerData } from "../utils/access.js";
import { validateFarmInput } from "../utils/farmValidation.js";
import { parseRemoveImages, MAX_IMAGES } from "../utils/imageHelpers.js";

const IMAGE_UPLOAD_CONCURRENCY = 3;

export const createFarm = async (req, res) => {
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

    const { error, value } = await validateFarmInput(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    let images = [];

    if (req.files && req.files.length > 0) {
      const limit = pLimit(IMAGE_UPLOAD_CONCURRENCY);

      images = await Promise.all(
        req.files.map((file) =>
          limit(() => uploadBufferToCloudinary(file.buffer, "freshmart/farms")),
        ),
      );
    }

    const farm = await Farm.create({
      farmer: farmer._id,
      ...value,
      images,
      products: { allYear: [], winter: [], summer: [], monsoon: [] },
    });

    farmer.farms.push(farm._id);
    await farmer.save();

    return res.status(201).json({
      success: true,
      message: "Farm created successfully",
      farm,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyFarms = async (req, res) => {
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

    const farms = await Farm.find({
      farmer: farmer._id,
    });

    return res.status(200).json({
      success: true,
      farms,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getFarmById = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid farm ID" });
    }

    const farm = await Farm.findById(farmId).populate({
      path: "farmer",
      select: "profileImage",
      populate: { path: "user", select: "name" },
    });

    if (!farm) {
      return res
        .status(404)
        .json({ success: false, message: "Farm not found" });
    }

    if (!farm.isActive && !(await canManageFarmerData(req.user, farm.farmer))) {
      return res
        .status(404)
        .json({ success: false, message: "Farm not found" });
    }

    return res.status(200).json({ success: true, farm });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      farmer: farmer._id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found or you are not authorized to update it",
      });
    }

    const { error, value } = await validateFarmInput(req.body, {
      partial: true,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const removeIds = parseRemoveImages(req.body.removeImages, farm.images);
    const incoming = req.files?.length || 0;

    if (farm.images.length - removeIds.length + incoming > MAX_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `A farm can have at most ${MAX_IMAGES} photos`,
      });
    }

    Object.assign(farm, value); // `products` is server-managed, never taken from the client

    if (removeIds.length > 0) {
      await Promise.all(removeIds.map((id) => deleteFromCloudinary(id)));
      farm.images = farm.images.filter(
        (img) => !removeIds.includes(img.publicId),
      );
    }

    if (incoming > 0) {
      const limit = pLimit(IMAGE_UPLOAD_CONCURRENCY);

      const uploaded = await Promise.all(
        req.files.map((file) =>
          limit(() => uploadBufferToCloudinary(file.buffer, "freshmart/farms")),
        ),
      );

      farm.images.push(...uploaded);
    }

    await farm.save();

    return res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      farm,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farmer = await Farmer.findOne({
      user: req.user.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      farmer: farmer._id,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found or you are not authorized to delete it",
      });
    }

    if (await farmHasActiveWork(farm._id)) {
      return res.status(400).json({
        success: false,
        message: "This farm has orders or company sales in progress",
      });
    }

    await deleteFarmCascade(farm);

    farmer.farms.pull(farmId);

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
