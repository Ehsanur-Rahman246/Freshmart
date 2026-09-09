import api from "./api";

export const getAdminDashboard = () =>
  api.get("/admin/dashboard");
export const getAllCustomers = () =>
  api.get("/admin/customers");
export const getCustomerById = (customerId) =>
  api.get(`/admin/customers/${customerId}`);
export const getAllFarmers = () =>
  api.get("/admin/farmers");
export const getFarmerById = (farmerId) =>
  api.get(`/admin/farmers/${farmerId}`);
export const getAllFarms = () =>
  api.get("/admin/farms");
export const toggleUserStatus = (userId) =>
  api.patch(`/admin/users/${userId}/status`);
export const getCompanySaleQueue = () =>
  api.get("/admin/company-sales");
export const markCompanySalePickedUp = (productId) =>
  api.patch(`/admin/company-sales/${productId}/pickup`);
export const finalizeCompanySale = (productId, company) =>
  api.patch(`/admin/company-sales/${productId}/finalize`, { company });
export const getAdminRevenueSummary = () => api.get("/admin/revenue");
export const getFarmRevenue = (farmId) =>
  api.get(`/admin/revenue/farm/${farmId}`);