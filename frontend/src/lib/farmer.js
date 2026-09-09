import api from "./api";

export const getFarmerProfile = () => api.get("/farmer/profile");
export const updateFarmerProfile = (data) => api.patch("/farmer/profile", data);