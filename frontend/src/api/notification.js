import api from "./api";

export const getMyNotifications = () => api.get("/notifications");
export const getUnreadNotifications = () => api.get("/notifications/unread");
export const markNotificationAsRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => api.patch("/notifications/mark-all-read");
export const deleteNotification = (notificationId) => api.delete(`/notifications/${notificationId}`);
export const deleteAllNotifications = () => api.delete("/notifications");