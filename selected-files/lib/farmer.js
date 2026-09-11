import api from "../api/api";

export const getFarmerProfile = () => api.get("/farmer/profile");
export const updateFarmerProfile = (data) => api.patch("/farmer/profile", data);
export const respondToCompanySaleOffer = (productId, accept) =>
  api.patch(`/farmer/company-sale/${productId}/respond`, { accept });
export const markCompanySaleReady = (productId) =>
  api.patch(`/farmer/company-sale/${productId}/ready`);
export const getMyRevenue = () => api.get("/farmer/revenue");
