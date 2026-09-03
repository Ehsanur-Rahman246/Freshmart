import express from "express";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { createProduct, deleteProduct, getMyProducts, getProductById, getProducts, updateProduct } from "../controllers/productControllers.js";

const productRouter = express.Router();

productRouter.post(
  "/",
  userAuth,
  roleAuth("farmer"),
  createProduct,
);

productRouter.get(
  "/my-products",
  userAuth,
  roleAuth("farmer"),
  getMyProducts,
);

productRouter.get("/", getProducts);

productRouter.get(
  "/:productId",
  getProductById,
);

productRouter.patch(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  updateProduct,
);

productRouter.delete(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  deleteProduct,
);

export default productRouter;