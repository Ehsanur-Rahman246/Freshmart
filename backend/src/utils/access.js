import Farmer from "../models/Farmer.js";

// true for admins, or for the farmer who owns `farmerRef` (id or populated doc)
export const canManageFarmerData = async (user, farmerRef) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "farmer") return false;

  const farmer = await Farmer.findOne({ user: user.userId }).select("_id");
  if (!farmer) return false;

  return farmer._id.toString() === (farmerRef?._id || farmerRef).toString();
};
