import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartControllers.js";

import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";

const cartRouter = express.Router();

cartRouter.get(
  "/",
  userAuth,
  roleAuth("customer"),
  getCart,
);

cartRouter.post(
  "/",
  userAuth,
  roleAuth("customer"),
  addToCart,
);

cartRouter.patch(
  "/:productId",
  userAuth,
  roleAuth("customer"),
  updateCartItem,
);

cartRouter.delete(
  "/:productId",
  userAuth,
  roleAuth("customer"),
  removeFromCart,
);

export default cartRouter;