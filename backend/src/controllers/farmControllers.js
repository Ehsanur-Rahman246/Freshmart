import Farm from "../models/farms.js";
import Farmer from "../models/farmers.js";

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
      images,
      isActive,
      establishedYear,
      size,
      location,
      farmType,
      products,
    } = req.body;

    if (
      !name ||
      !size ||
      !size.value ||
      !size.unit ||
      !location ||
      !location.district ||
      !location.upazila ||
      !location.village ||
      !farmType ||
      !Array.isArray(farmType) ||
      farmType.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required farm fields must be provided",
      });
    }

    const farm = await Farm.create({
      farmer: farmer._id,
      name,
      description,
      images,
      isActive,
      establishedYear,
      size,
      location,
      farmType,
      products,
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

    const farm = await Farm.findById(farmId)
      .populate({
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
      images,
      isActive,
      establishedYear,
      size,
      location,
      farmType,
      products,
    } = req.body;

    if (name !== undefined) farm.name = name;
    if (description !== undefined) farm.description = description;
    if (images !== undefined) farm.images = images;
    if (isActive !== undefined) farm.isActive = isActive;
    if (establishedYear !== undefined) {
      farm.establishedYear = establishedYear;
    }
    if (size !== undefined) farm.size = size;
    if (location !== undefined) farm.location = location;
    if (farmType !== undefined) farm.farmType = farmType;
    if (products !== undefined) farm.products = products;

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
