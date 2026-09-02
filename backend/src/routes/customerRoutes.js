import express from "express";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { addAddress, addToWishlist, deleteAddress, getCustomerProfile, getWishlist, removeFromWishlist, setDefaultAddress, updateAddress, updateCustomerProfile } from "../controllers/customerControllers.js";

const customerRouter = express.Router();

customerRouter.get("/profile", userAuth, roleAuth("customer"), getCustomerProfile);
customerRouter.patch("/profile", userAuth, roleAuth("customer"), updateCustomerProfile);
customerRouter.post("/addresses", userAuth, roleAuth("customer"), addAddress);
customerRouter.patch("/addresses/:addressId", userAuth, roleAuth("customer"), updateAddress);
customerRouter.delete("/addresses/:addressId", userAuth, roleAuth("customer"), deleteAddress);
customerRouter.patch("/addresses/:addressId/default", userAuth, roleAuth("customer"), setDefaultAddress);
customerRouter.get("/wishlist", userAuth, roleAuth("customer"), getWishlist);
customerRouter.post("/wishlist/:productId", userAuth, roleAuth("customer"), addToWishlist);
customerRouter.delete("/wishlist/:productId", userAuth, roleAuth("customer"), removeFromWishlist);

export default customerRouter;
