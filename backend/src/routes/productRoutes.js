import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProductById,
  getProducts,
  getRelatedProducts,
  searchProductNames,
  updateProduct,
} from "../controllers/productControllers.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 4),
  createProduct,
);
productRouter.get("/my-products", userAuth, roleAuth("farmer"), getMyProducts);
productRouter.get("/", getProducts);
productRouter.get(
  "/search-names",
  userAuth,
  roleAuth("admin"),
  searchProductNames,
);
productRouter.get("/:productId/related", getRelatedProducts);
productRouter.get("/:productId", optionalAuth, getProductById);
productRouter.patch(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 4),
  updateProduct,
);
productRouter.delete(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  deleteProduct,
);

export default productRouter;
