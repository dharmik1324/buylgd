import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";

const SUPPORT_URL = "/support";

// User actions
export const askSupplier = createAsyncThunk(
    "support/askSupplier",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post(`${SUPPORT_URL}/ask`, formData);
            toast.success("Query sent successfully!");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to send query";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const fetchMyTickets = createAsyncThunk(
    "support/fetchMyTickets",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(`${SUPPORT_URL}/my`);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch inquiries history";
            return rejectWithValue(message);
        }
    }
);

// Admin actions
export const fetchAllTickets = createAsyncThunk(
    "support/fetchAllTickets",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(`${SUPPORT_URL}/admin/inquiries`);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch tickets";
            return rejectWithValue(message);
        }
    }
);

export const replyToTicket = createAsyncThunk(
    "support/replyToTicket",
    async ({ id, adminReply }, { rejectWithValue }) => {
        try {
            const res = await api.put(`${SUPPORT_URL}/reply/${id}`, { adminReply });
            toast.success("Reply sent successfully");
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to send reply";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const addUserMessage = createAsyncThunk(
    "support/addUserMessage",
    async ({ id, message }, { rejectWithValue }) => {
        try {
            const res = await api.post(`${SUPPORT_URL}/message/${id}`, { message });
            return res.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send message";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deleteTicket = createAsyncThunk(
    "support/deleteTicket",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`${SUPPORT_URL}/${id}`);
            toast.success("Ticket deleted successfully");
            return id;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete ticket";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const updateTicketStatus = createAsyncThunk(
    "support/updateTicketStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await api.put(`${SUPPORT_URL}/status/${id}`, { status });
            toast.success(`Inquiry marked as ${status}`);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update status";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const supportSlice = createSlice({
    name: "support",
    initialState: {
        tickets: [],
        myTickets: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllTickets.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload;
            })
            .addCase(fetchAllTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(replyToTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) {
                    state.tickets[idx] = action.payload;
                }
            })
            .addCase(deleteTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.filter(t => t._id !== action.payload);
                state.myTickets = state.myTickets.filter(t => t._id !== action.payload);
            })
            .addCase(updateTicketStatus.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) {
                    state.tickets[idx] = action.payload;
                }
            })
            .addCase(addUserMessage.fulfilled, (state, action) => {
                const idx = state.myTickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) {
                    state.myTickets[idx] = action.payload;
                }
                const adminIdx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (adminIdx !== -1) {
                    state.tickets[adminIdx] = action.payload;
                }
            })
            .addCase(fetchMyTickets.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.myTickets = action.payload;
            })
            .addCase(fetchMyTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default supportSlice.reducer;
