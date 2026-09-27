import api from "./api";

export const createPromoCode = (data) => api.post("/promo-codes", data);
export const getAllPromoCodes = () => api.get("/promo-codes");
export const updatePromoCode = (promoCodeId, data) =>
  api.patch(`/promo-codes/${promoCodeId}`, data);
