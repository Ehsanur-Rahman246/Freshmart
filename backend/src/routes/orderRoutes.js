import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFarmerOrders,
  updateOrderStatus,
  getAllOrders,
  getOrdersByCustomer,
  getOrdersByFarmer,
} from "../controllers/orderControllers.js";

import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";

const orderRouter = express.Router();


// ==========================================
// CUSTOMER ROUTES
// ==========================================

orderRouter.post(
  "/",
  userAuth,
  roleAuth("customer"),
  createOrder,
);

orderRouter.get(
  "/my-orders",
  userAuth,
  roleAuth("customer"),
  getMyOrders,
);

orderRouter.patch(
  "/:orderId/cancel",
  userAuth,
  roleAuth("customer"),
  cancelOrder,
);


// ==========================================
// FARMER ROUTES
// ==========================================

orderRouter.get(
  "/farmer/my-orders",
  userAuth,
  roleAuth("farmer"),
  getFarmerOrders,
);

orderRouter.patch(
  "/:orderId/status",
  userAuth,
  roleAuth("farmer"),
  updateOrderStatus,
);


// ==========================================
// ADMIN ROUTES
// ==========================================

orderRouter.get(
  "/admin/all",
  userAuth,
  roleAuth("admin"),
  getAllOrders,
);

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


// ==========================================
// SINGLE ORDER
// CUSTOMER / FARMER / ADMIN
// ==========================================

orderRouter.get(
  "/:orderId",
  userAuth,
  roleAuth("customer", "farmer", "admin"),
  getOrderById,
);

export default orderRouter;