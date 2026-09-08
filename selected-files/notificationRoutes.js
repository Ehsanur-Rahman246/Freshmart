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

notificationRouter.use(userAuth);
notificationRouter.get("/", getMyNotifications);
notificationRouter.get("/unread", getUnreadNotifications);
notificationRouter.patch("/mark-all-read", markAllNotificationsAsRead);
notificationRouter.patch("/:notificationId/read", markNotificationAsRead);
notificationRouter.delete("/:notificationId", deleteNotification);
notificationRouter.delete("/", deleteAllNotifications);

export default notificationRouter;
