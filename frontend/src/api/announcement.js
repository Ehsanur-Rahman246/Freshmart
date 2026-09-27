import api from "./api";

// customer / farmer
export const getMyAnnouncements = () => api.get("/announcements");
export const markAnnouncementRead = (statusId) =>
  api.patch(`/announcements/${statusId}/read`);
export const deleteMyAnnouncement = (statusId) =>
  api.delete(`/announcements/${statusId}`);

// admin
export const createAnnouncement = (data) =>
  api.post("/announcements/admin", data); // { audience, title, message }
export const getAnnouncementHistory = () =>
  api.get("/announcements/admin/history");
export const sendAdminEmail = (data) =>
  api.post("/announcements/admin/email", data); // { recipientScope, recipientUserId?, subject, message }
export const getEmailLog = () => api.get("/announcements/admin/email-log");
