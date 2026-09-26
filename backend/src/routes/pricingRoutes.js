import express from "express";
import userAuth from "../middlewares/userAuth.js";
import roleAuth from "../middlewares/roleAuth.js";
import {
  getPricingRanges,
  createPricingRange,
  updatePricingRange,
  deletePricingRange,
  getPriceLedger,
  getProductPriceLedger,
} from "../controllers/pricingControllers.js";

const pricingRouter = express.Router();

pricingRouter.get("/", getPricingRanges); // public: farmers need this when pricing a listing
pricingRouter.post("/", userAuth, roleAuth("admin"), createPricingRange);
pricingRouter.patch("/:name", userAuth, roleAuth("admin"), updatePricingRange);
pricingRouter.delete("/:name", userAuth, roleAuth("admin"), deletePricingRange);

// universal ledger — same list for every farmer
pricingRouter.get(
  "/ledger",
  userAuth,
  roleAuth("farmer", "admin"),
  getPriceLedger,
);
pricingRouter.get(
  "/ledger/:productId",
  userAuth,
  roleAuth("admin", "farmer"),
  getProductPriceLedger,
);

export default pricingRouter;
