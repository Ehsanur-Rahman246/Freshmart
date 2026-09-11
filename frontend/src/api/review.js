import api from "./api";

// Public
export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const getFarmReviews = (farmId) => api.get(`/reviews/farm/${farmId}`);

// Customer
export const createProductReview = (productId, data) => api.post(`/reviews/product/${productId}`, data);
export const createFarmReview = (farmId, data) => api.post(`/reviews/farm/${farmId}`, data);
export const updateReview = (reviewId, data) => api.patch(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);