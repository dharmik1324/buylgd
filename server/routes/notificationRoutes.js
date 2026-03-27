const express = require("express");
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} = require("../controller/admin/notificationController");

// GET /api/admin/notifications - Get all notifications (with pagination)
router.get("/", getNotifications);

// GET /api/admin/notifications/unread-count - Get unread count
router.get("/unread-count", getUnreadCount);

// PUT /api/admin/notifications/mark-all-read - Mark all as read
router.put("/mark-all-read", markAllAsRead);

// PUT /api/admin/notifications/:id/read - Mark single as read
router.put("/:id/read", markAsRead);

// DELETE /api/admin/notifications/read - Delete all read notifications
router.delete("/read", deleteAllRead);

// DELETE /api/admin/notifications/:id - Delete single notification
router.delete("/:id", deleteNotification);

module.exports = router;
