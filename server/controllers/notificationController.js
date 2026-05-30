/**
 * Notification Controller
 */

import Notification from "../models/notificationModel.js";
import { getIO } from "../utils/socket.js";

// GET ALL NOTIFICATIONS
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ userId });

    res.json({ notifications, total });
  } catch (err) {
    next(err);
  }
};

// GET UNREAD COUNT
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
};

// MARK AS READ
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Marked as read", notification });
  } catch (err) {
    next(err);
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};

// CREATE NOTIFICATION (Internal use)
export const createNotification = async (userId, title, message, type, metadata = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      metadata,
    });

    try {
      const io = getIO();
      if (io) {
        const payload = notification && notification.toObject ? notification.toObject() : notification;
        io.to(`user_${userId}`).emit("notification", payload);
      }
    } catch (err) {
      console.error("Error emitting notification via socket:", err);
    }

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// DELETE OLD NOTIFICATIONS
export const cleanupOldNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Notification.deleteMany({
      userId,
      isRead: true,
      createdAt: { $lt: thirtyDaysAgo },
    });

    res.json({ message: "Old notifications cleaned up" });
  } catch (err) {
    next(err);
  }
};
