import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createFarm,
  deleteFarm,
  getFarmById,
  getMyFarms,
  updateFarm,
} from "../controllers/farmControllers.js";
import { getAllFarms } from "../controllers/userControllers.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const farmRouter = express.Router();

farmRouter.post(
  "/",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 4),
  createFarm,
);
farmRouter.get("/my-farms", userAuth, roleAuth("farmer"), getMyFarms);
farmRouter.get("/:farmId", optionalAuth, getFarmById);
farmRouter.patch(
  "/:farmId",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 4),
  updateFarm,
);
farmRouter.get("/", optionalAuth, getAllFarms);
farmRouter.delete("/:farmId", userAuth, roleAuth("farmer"), deleteFarm);

export default farmRouter;
