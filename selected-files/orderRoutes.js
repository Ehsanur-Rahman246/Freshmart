import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  confirmPayment,
  getFarmerOrders,
  updateOrderStatus,
  getAllOrders,
  getOrdersByCustomer,
  getOrdersByFarmer,
  acceptOrder,
  rejectOrder,
  getFarmOrders,
  getOrdersByFarm,
} from "../controllers/orderControllers.js";

import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";

const orderRouter = express.Router();

// CUSTOMER
orderRouter.post("/", userAuth, roleAuth("customer"), createOrder);
orderRouter.get("/my-orders", userAuth, roleAuth("customer"), getMyOrders);
orderRouter.patch(
  "/:orderId/cancel",
  userAuth,
  roleAuth("customer"),
  cancelOrder,
);
orderRouter.patch(
  "/group/:orderGroupId/confirm-payment",
  userAuth,
  roleAuth("customer"),
  confirmPayment,
);
// FARMER
orderRouter.get(
  "/farmer/my-orders",
  userAuth,
  roleAuth("farmer"),
  getFarmerOrders,
);
orderRouter.get("/farm/:farmId", userAuth, roleAuth("farmer"), getFarmOrders);
orderRouter.patch(
  "/:orderId/status",
  userAuth,
  roleAuth("farmer"),
  updateOrderStatus,
);
orderRouter.patch(
  "/:orderId/accept",
  userAuth,
  roleAuth("farmer"),
  acceptOrder,
);
orderRouter.patch(
  "/:orderId/reject",
  userAuth,
  roleAuth("farmer"),
  rejectOrder,
);
// ADMIN
orderRouter.get("/admin/all", userAuth, roleAuth("admin"), getAllOrders);
orderRouter.get(
  "/admin/customer/:customerId",
  userAuth,
  roleAuth("admin"),
  getOrdersByCustomer,
);
orderRouter.get(
  "/admin/farmer/:farmerId",
  userAuth,
  roleAuth("admin"),
  getOrdersByFarmer,
);
orderRouter.get(
  "/admin/farm/:farmId",
  userAuth,
  roleAuth("admin"),
  getOrdersByFarm,
);
// ALL
orderRouter.get(
  "/:orderId",
  userAuth,
  roleAuth("customer", "farmer", "admin"),
  getOrderById,
);

export default orderRouter;
