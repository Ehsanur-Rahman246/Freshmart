import api from "./api";

export const getPricingRanges = () => api.get("/pricing");
export const createPricingRange = (data) => api.post("/pricing", data); // { name, category, min, max }
export const updatePricingRange = (name, data) =>
  api.patch(`/pricing/${encodeURIComponent(name)}`, data); // { category?, min, max }
export const deletePricingRange = (name) =>
  api.delete(`/pricing/${encodeURIComponent(name)}`);
export const getProductPriceLedger = (productId) =>
  api.get(`/pricing/ledger/${productId}`);
export const getPriceLedger = () => api.get("/pricing/ledger");
