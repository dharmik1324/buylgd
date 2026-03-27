const Notification = require("../../models/Notification");

// Get all notifications with pagination and filtering
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, read } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (type && type !== "all") filter.type = type;
        if (read !== undefined && read !== "") filter.read = read === "true";

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments(filter)
        ]);

        const unreadCount = await Notification.countDocuments({ read: false });

        res.status(200).json({
            success: true,
            notifications,
            total,
            unreadCount,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: false });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete a single notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete all read notifications
const deleteAllRead = async (req, res) => {
    try {
        await Notification.deleteMany({ read: true });
        res.status(200).json({ success: true, message: "All read notifications deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Helper: Create and emit a notification (used by other controllers)
const createNotification = async ({ title, message, type = "system", icon = "bell", link = "", metadata = {} }) => {
    try {
        const notification = new Notification({
            title,
            message,
            type,
            icon,
            link,
            metadata
        });
        await notification.save();

        // Emit to all connected admin sockets
        if (global.io) {
            global.io.to("admins").emit("notification", {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                icon: notification.icon,
                link: notification.link,
                read: notification.read,
                metadata: notification.metadata,
                createdAt: notification.createdAt
            });
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    createNotification
};
