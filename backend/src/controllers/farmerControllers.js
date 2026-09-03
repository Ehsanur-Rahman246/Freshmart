import Farmer from "../models/farmer.js";

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
