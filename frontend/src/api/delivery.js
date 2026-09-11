import api from "./api";

export const getOrdersAwaitingAssignment = () =>
  api.get("/delivery/awaiting-assignment");
export const getAvailableDriversForOrder = (orderId) =>
  api.get(`/delivery/${orderId}/available-drivers`);
export const assignDriverToOrder = (orderId, driverId) =>
  api.patch(`/delivery/${orderId}/assign-driver`, {
    driverId,
  });
