import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

// Protected routes
router.use(checkAuth);

// Get all notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

// Cleanup old notifications
router.delete("/cleanup/old", notificationController.cleanupOldNotifications);

export default router;
