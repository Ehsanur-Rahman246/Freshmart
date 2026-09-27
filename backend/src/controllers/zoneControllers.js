import Zone from "../models/Zone.js";

export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find().select("zoneId label districts").sort({ zoneId: 1 });

    return res.status(200).json({ success: true, zones });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};