import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";

const NOTIF_URL = "/admin/notifications";

// Fetch notifications with pagination
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async ({ page = 1, limit = 20, type = "all", read = "" } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            if (type && type !== "all") params.type = type;
            if (read !== "") params.read = read;

            const res = await api.get(NOTIF_URL, { params });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch notifications");
        }
    }
);

// Fetch unread count only
export const fetchUnreadCount = createAsyncThunk(
    "notifications/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(`${NOTIF_URL}/unread-count`);
            return res.data.count;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch unread count");
        }
    }
);

// Mark single notification as read
export const markNotificationRead = createAsyncThunk(
    "notifications/markRead",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.put(`${NOTIF_URL}/${id}/read`);
            return res.data.notification;
        } catch (err) {
            const message = err.response?.data || "Failed to mark as read";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Mark all as read
export const markAllNotificationsRead = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try {
            await api.put(`${NOTIF_URL}/mark-all-read`);
            toast.success("All notifications marked as read");
            return true;
        } catch (err) {
            const message = err.response?.data || "Failed to mark all as read";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Delete a notification
export const deleteNotification = createAsyncThunk(
    "notifications/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`${NOTIF_URL}/${id}`);
            toast.success("Notification deleted");
            return id;
        } catch (err) {
            const message = err.response?.data || "Failed to delete notification";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Delete all read notifications
export const deleteReadNotifications = createAsyncThunk(
    "notifications/deleteRead",
    async (_, { rejectWithValue }) => {
        try {
            await api.delete(`${NOTIF_URL}/read`);
            toast.success("All read notifications deleted");
            return true;
        } catch (err) {
            const message = err.response?.data || "Failed to delete read notifications";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        unreadCount: 0,
        total: 0,
        page: 1,
        totalPages: 1,
        loading: false,
        error: null,
    },
    reducers: {
        // Add a real-time notification from socket
        addRealtimeNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
            state.total += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch unread count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            // Mark single as read
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const idx = state.notifications.findIndex(n => n._id === action.payload._id);
                if (idx !== -1) {
                    state.notifications[idx].read = true;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            // Mark all as read
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.notifications.forEach(n => { n.read = true; });
                state.unreadCount = 0;
            })
            // Delete single
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const removed = state.notifications.find(n => n._id === action.payload);
                state.notifications = state.notifications.filter(n => n._id !== action.payload);
                state.total -= 1;
                if (removed && !removed.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Delete all read
            .addCase(deleteReadNotifications.fulfilled, (state) => {
                state.notifications = state.notifications.filter(n => !n.read);
                state.total = state.notifications.length;
            });
    },
});

export const { addRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
