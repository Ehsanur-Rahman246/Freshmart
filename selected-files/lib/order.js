import api from "./api";

// Customer
export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = () => api.get("/orders/my-orders");
export const cancelOrder = (orderId) => api.patch(`/orders/${orderId}/cancel`);

// Farmer
export const getFarmerOrders = () => api.get("/orders/farmer/my-orders");
export const getFarmOrders = (farmId) =>
  api.get(`/orders/farm/${farmId}`);
export const updateOrderStatus = (orderId, data) => api.patch(`/orders/${orderId}/status`, data);
export const acceptOrder = (orderId) =>
  api.patch(`/orders/${orderId}/accept`);
export const rejectOrder = (orderId) =>
  api.patch(`/orders/${orderId}/reject`);

// Admin
export const getAllOrders = () => api.get("/orders/admin/all");
export const getOrdersByCustomer = (customerId) => api.get(`/orders/admin/customer/${customerId}`);
export const getOrdersByFarmer = (farmerId) => api.get(`/orders/admin/farmer/${farmerId}`);
export const getOrdersByFarm = (farmId) =>
  api.get(`/orders/admin/farm/${farmId}`);

// All
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);