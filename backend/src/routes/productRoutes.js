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
  updateProduct,
} from "../controllers/productControllers.js";

const productRouter = express.Router();

productRouter.post(
  "/",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 6),
  createProduct,
);
productRouter.get("/my-products", userAuth, roleAuth("farmer"), getMyProducts);
productRouter.get("/", getProducts);
productRouter.get("/:productId", getProductById);
productRouter.patch(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 6),
  updateProduct,
);
productRouter.delete(
  "/:productId",
  userAuth,
  roleAuth("farmer"),
  deleteProduct,
);

export default productRouter;