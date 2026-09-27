import express from "express";
import { getZones } from "../controllers/zoneControllers.js";

const zoneRouter = express.Router();

zoneRouter.get("/", getZones);

export default zoneRouter;
