import api from "./api";

export const getCustomerProfile = () => api.get("/customer/profile");
export const updateCustomerProfile = (data) =>
  api.patch("/customer/profile", data);

export const addAddress = (data) => api.post("/customer/addresses", data);
export const updateAddress = (addressId, data) =>
  api.patch(`/customer/addresses/${addressId}`, data);
export const deleteAddress = (addressId) =>
  api.delete(`/customer/addresses/${addressId}`);
export const setDefaultAddress = (addressId) =>
  api.patch(`/customer/addresses/${addressId}/default`);

export const getWishlist = () => api.get("/customer/wishlist");
export const addToWishlist = (productId) =>
  api.post(`/customer/wishlist/${productId}`);
export const removeFromWishlist = (productId) =>
  api.delete(`/customer/wishlist/${productId}`);
