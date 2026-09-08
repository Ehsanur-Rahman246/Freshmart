import express from "express";

import {
  getMyNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationControllers.js";

import userAuth from "../middlewares/userAuth.js";

const notificationRouter = express.Router();

// All notification routes require login
notificationRouter.use(userAuth);

// ==========================================
// GET NOTIFICATIONS
// ==========================================

// Get all my notifications
notificationRouter.get("/", getMyNotifications);

// Get unread notifications
notificationRouter.get("/unread", getUnreadNotifications);

// ==========================================
// UPDATE NOTIFICATIONS
// ==========================================

// Mark all notifications as read
notificationRouter.patch("/mark-all-read", markAllNotificationsAsRead);

// Mark one notification as read
notificationRouter.patch("/:notificationId/read", markNotificationAsRead);

// ==========================================
// DELETE NOTIFICATION
// ==========================================

notificationRouter.delete("/:notificationId", deleteNotification);
notificationRouter.delete("/", deleteAllNotifications);

export default notificationRouter;
