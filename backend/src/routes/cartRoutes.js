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

cartRouter.use(userAuth, roleAuth("customer"));

cartRouter.get("/", getCart);
cartRouter.post("/", addToCart);
cartRouter.patch("/:productId", updateCartItem);
cartRouter.delete("/:productId", removeFromCart);

export default cartRouter;
