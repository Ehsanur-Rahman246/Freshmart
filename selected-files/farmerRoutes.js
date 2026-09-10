import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getFarmerProfile,
  updateFarmerProfile,
  respondToCompanySaleOffer,
  markCompanySaleReady,
  getMyRevenue,
} from "../controllers/farmerControllers.js";

const farmerRouter = express.Router();

farmerRouter.get("/profile", userAuth, roleAuth("farmer"), getFarmerProfile);
farmerRouter.patch(
  "/profile",
  userAuth,
  roleAuth("farmer"),
  upload.single("profileImage"),
  updateFarmerProfile,
);
farmerRouter.patch(
  "/company-sale/:productId/respond",
  userAuth,
  roleAuth("farmer"),
  respondToCompanySaleOffer,
);
farmerRouter.patch(
  "/company-sale/:productId/ready",
  userAuth,
  roleAuth("farmer"),
  markCompanySaleReady,
);
farmerRouter.get("/revenue", userAuth, roleAuth("farmer"), getMyRevenue);

export default farmerRouter;