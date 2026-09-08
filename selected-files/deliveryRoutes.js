import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  getOrdersAwaitingAssignment,
  getAvailableDriversForOrder,
  assignDriverToOrder,
} from "../controllers/deliveryControllers.js";

const deliveryRouter = express.Router();

deliveryRouter.use(userAuth, roleAuth("admin"));

deliveryRouter.get("/awaiting-assignment", getOrdersAwaitingAssignment);
deliveryRouter.get("/:orderId/available-drivers", getAvailableDriversForOrder);
deliveryRouter.patch("/:orderId/assign-driver", assignDriverToOrder);

export default deliveryRouter;