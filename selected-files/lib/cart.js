import api from "./api";

export const getCart = () => api.get("/cart");
export const addToCart = (data) => api.post("/cart", data);
export const updateCartItem = (productId, data) => api.patch(`/cart/${productId}`, data);
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);