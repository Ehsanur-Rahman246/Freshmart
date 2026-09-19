import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getCustomerProfile,
  getWallet,
  getWishlist,
  removeFromWishlist,
  setDefaultAddress,
  updateAddress,
  updateCustomerProfile,
} from "../controllers/customerControllers.js";

const customerRouter = express.Router();

customerRouter.use(userAuth, roleAuth("customer"));

customerRouter.get("/profile", getCustomerProfile);
customerRouter.patch(
  "/profile",
  upload.single("profileImage"),
  updateCustomerProfile,
);
customerRouter.get("/wallet", getWallet);
customerRouter.post("/addresses", addAddress);
customerRouter.patch("/addresses/:addressId", updateAddress);
customerRouter.delete("/addresses/:addressId", deleteAddress);
customerRouter.patch("/addresses/:addressId/default", setDefaultAddress);
customerRouter.get("/wishlist", getWishlist);
customerRouter.post("/wishlist/:productId", addToWishlist);
customerRouter.delete("/wishlist/:productId", removeFromWishlist);

export default customerRouter;
