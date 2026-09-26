import Farm from "../models/Farm.js";

export const getInactiveFarmIds = () =>
  Farm.find({ isActive: false }).distinct("_id");