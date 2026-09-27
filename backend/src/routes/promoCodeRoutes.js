import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  createPromoCode,
  getAllPromoCodes,
  updatePromoCode,
} from "../controllers/promoCodeControllers.js";

const promoCodeRouter = express.Router();

promoCodeRouter.use(userAuth, roleAuth("admin"));

promoCodeRouter.post("/", createPromoCode);
promoCodeRouter.get("/", getAllPromoCodes);
promoCodeRouter.patch("/:promoCodeId", updatePromoCode);

export default promoCodeRouter;
