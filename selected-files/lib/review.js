import api from "./api";

// Public
export const getProductReviews = (productId) =>
  api.get(`/reviews/product/${productId}`);
export const getFarmReviews = (farmId) => api.get(`/reviews/farm/${farmId}`);

// Customer
export const createProductReview = (productId, data) =>
  api.post(`/reviews/product/${productId}`, data);
export const createFarmReview = (farmId, data) =>
  api.post(`/reviews/farm/${farmId}`, data);
export const updateReview = (reviewId, data) =>
  api.patch(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

export const getMyReviews = () => api.get("/reviews/mine");
export const getFarmerReviews = () => api.get("/reviews/farmer/mine");
export const getAllReviewsAdmin = () => api.get("/reviews/admin/all");
export const addReviewReply = (reviewId, message) =>
  api.post(`/reviews/${reviewId}/reply`, { message });
export const reportReview = (reviewId, message) =>
  api.post(`/reviews/${reviewId}/report`, { message });
export const adminDeleteReview = (reviewId) =>
  api.delete(`/reviews/admin/${reviewId}`);
export const deleteReply = (reviewId, replyId) =>
  api.delete(`/reviews/${reviewId}/reply/${replyId}`);
