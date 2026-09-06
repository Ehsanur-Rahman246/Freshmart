import api from "./api";

// Customer
export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = () => api.get("/orders/my-orders");
export const cancelOrder = (orderId) => api.patch(`/orders/${orderId}/cancel`);

// Farmer
export const getFarmerOrders = () => api.get("/orders/farmer/my-orders");
export const updateOrderStatus = (orderId, data) => api.patch(`/orders/${orderId}/status`, data);

// Admin
export const getAllOrders = () => api.get("/orders/admin/all");
export const getOrdersByCustomer = (customerId) => api.get(`/orders/admin/customer/${customerId}`);
export const getOrdersByFarmer = (farmerId) => api.get(`/orders/admin/farmer/${farmerId}`);

// Shared (customer / farmer / admin — access controlled by roleAuth on the backend)
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);