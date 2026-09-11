import Farm from "../models/Farm.js";
import Farmer from "../models/Farmer.js";
import pLimit from "p-limit";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

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

    const {
      name,
      description,
      isActive,
      establishedYear,
      size,
      location,
      farmType,
      products,
    } = req.body;

    // size, location, and farmType may arrive as JSON strings via form-data
    const parsedSize = typeof size === "string" ? JSON.parse(size) : size;
    const parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;
    const parsedFarmType =
      typeof farmType === "string" ? JSON.parse(farmType) : farmType;
    const parsedProducts =
      typeof products === "string" ? JSON.parse(products) : products;

    if (
      !name ||
      !parsedSize ||
      !parsedSize.value ||
      !parsedSize.unit ||
      !parsedLocation ||
      !parsedLocation.district ||
      !parsedLocation.upazila ||
      !parsedLocation.village ||
      !parsedFarmType ||
      !Array.isArray(parsedFarmType) ||
      parsedFarmType.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required farm fields must be provided",
      });
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
      name,
      description,
      images,
      isActive,
      establishedYear,
      size: parsedSize,
      location: parsedLocation,
      farmType: parsedFarmType,
      products: parsedProducts,
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

    const farm = await Farm.findById(farmId).populate({
      path: "farmer",
      select: "profileImage",
      populate: {
        path: "user",
        select: "name",
      },
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
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

    const {
      name,
      description,
      isActive,
      establishedYear,
      size,
      location,
      farmType,
      products,
      removeImages,
    } = req.body;

    if (name !== undefined) farm.name = name;
    if (description !== undefined) farm.description = description;
    if (isActive !== undefined) farm.isActive = isActive;
    if (establishedYear !== undefined) {
      farm.establishedYear = establishedYear;
    }
    if (size !== undefined) {
      farm.size = typeof size === "string" ? JSON.parse(size) : size;
    }
    if (location !== undefined) {
      farm.location =
        typeof location === "string" ? JSON.parse(location) : location;
    }
    if (farmType !== undefined) {
      farm.farmType =
        typeof farmType === "string" ? JSON.parse(farmType) : farmType;
    }
    if (products !== undefined) {
      farm.products =
        typeof products === "string" ? JSON.parse(products) : products;
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

        farm.images = farm.images.filter(
          (img) => !removeIds.includes(img.publicId),
        );
      }
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
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

    if (farm.images && farm.images.length > 0) {
      await Promise.all(
        farm.images.map((img) => deleteFromCloudinary(img.publicId)),
      );
    }

    await Farm.findByIdAndDelete(farmId);

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