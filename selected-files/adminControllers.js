import Customer from "../models/Customer.js";
import Farmer from "../models/Farmer.js";
import Farm from "../models/Farm.js";
import Order from "../models/Order.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalFarmers,
      totalFarms,
      totalOrders,
      pendingAcceptance,
      processing,
      readyForPickup,
      pickedUp,
      delivered,
      rejected,
      cancelled,
    ] = await Promise.all([
      Customer.countDocuments(),
      Farmer.countDocuments(),
      Farm.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pendingAcceptance" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "readyForPickup" }),
      Order.countDocuments({ status: "pickedUp" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "rejected" }),
      Order.countDocuments({ status: "cancelled" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalFarmers,
        totalFarms,
        totalOrders,
        ordersByStatus: {
          pendingAcceptance,
          processing,
          readyForPickup,
          pickedUp,
          delivered,
          rejected,
          cancelled,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
