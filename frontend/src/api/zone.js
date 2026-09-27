import api from "./api";

// { zones: [{ zoneId, label, districts: [...] }] }
export const getZones = () => api.get("/zones");