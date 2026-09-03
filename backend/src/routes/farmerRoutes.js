import express from "express";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { getFarmerProfile, updateFarmerProfile } from "../controllers/farmerControllers.js";

const farmerRouter = express.Router();

farmerRouter.get(
  "/profile",
  userAuth,
  roleAuth("farmer"),
  getFarmerProfile,
);

farmerRouter.patch(
  "/profile",
  userAuth,
  roleAuth("farmer"),
  updateFarmerProfile,
);

export default farmerRouter;