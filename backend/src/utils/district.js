import Zone from "../models/Zone.js";
import { escapeRegex } from "./escapeRegex.js";

// Returns the canonical district name (as stored in Zone.districts) or null
export const resolveDistrict = async (input) => {
  const value = String(input ?? "").trim();
  if (!value) return null;

  const zone = await Zone.findOne({
    districts: { $regex: new RegExp(`^${escapeRegex(value)}$`, "i") },
  });

  if (!zone) return null;

  return (
    zone.districts.find((d) => d.toLowerCase() === value.toLowerCase()) || null
  );
};
