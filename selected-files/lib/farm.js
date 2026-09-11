import api from "../api/api";

export const createFarm = (data) => api.post("/farm", data);
export const getMyFarms = () => api.get("/farm/my-farms");
export const getFarmById = (farmId) => api.get(`/farm/${farmId}`);
export const updateFarm = (farmId, data) => api.patch(`/farm/${farmId}`, data);
export const deleteFarm = (farmId) => api.delete(`/farm/${farmId}`);
