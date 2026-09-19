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

farmerRouter.use(userAuth, roleAuth("farmer"));

farmerRouter.get("/profile", getFarmerProfile);
farmerRouter.patch(
  "/profile",
  upload.single("profileImage"),
  updateFarmerProfile,
);
farmerRouter.patch(
  "/company-sale/:productId/respond",
  respondToCompanySaleOffer,
);
farmerRouter.patch("/company-sale/:productId/ready", markCompanySaleReady);
farmerRouter.get("/revenue", userAuth, roleAuth("farmer"), getMyRevenue);

export default farmerRouter;
