import mongoose from "mongoose";

import Notification from "../models/Notification.js";

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// GET UNREAD NOTIFICATIONS
// ==========================================

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
      isRead: false,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
