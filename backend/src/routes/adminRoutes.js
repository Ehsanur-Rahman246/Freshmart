import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  getAdminDashboard,
  getCompanySaleQueue,
  markCompanySalePickedUp,
  finalizeCompanySale,
  getAdminRevenueSummary,
  getFarmRevenue,
} from "../controllers/adminControllers.js";
import {
  getAllCustomers,
  getCustomerById,
  getAllFarmers,
  getFarmerById,
  getAllFarms,
  toggleUserStatus,
} from "../controllers/userControllers.js";

const adminRouter = express.Router();

adminRouter.use(userAuth, roleAuth("admin"));

adminRouter.get("/dashboard", getAdminDashboard);
adminRouter.get("/customers", getAllCustomers);
adminRouter.get("/customers/:customerId", getCustomerById);
adminRouter.get("/farmers", getAllFarmers);
adminRouter.get("/farmers/:farmerId", getFarmerById);
adminRouter.get("/farms", getAllFarms);
adminRouter.patch("/users/:userId/status", toggleUserStatus);
adminRouter.get("/company-sales", getCompanySaleQueue);
adminRouter.patch("/company-sales/:productId/pickup", markCompanySalePickedUp);
adminRouter.patch("/company-sales/:productId/finalize", finalizeCompanySale);
adminRouter.get("/revenue", getAdminRevenueSummary);
adminRouter.get("/revenue/farm/:farmId", getFarmRevenue);

export default adminRouter;