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

const farmRouter = express.Router();

farmRouter.post(
  "/",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 6),
  createFarm,
);
farmRouter.get("/my-farms", userAuth, roleAuth("farmer"), getMyFarms);
farmRouter.get("/:farmId", getFarmById);
farmRouter.patch(
  "/:farmId",
  userAuth,
  roleAuth("farmer"),
  upload.array("images", 6),
  updateFarm,
);
farmRouter.delete("/:farmId", userAuth, roleAuth("farmer"), deleteFarm);

export default farmRouter;