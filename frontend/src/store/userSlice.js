import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";

const AUTH_USERS_URL = "/auth/users";

export const fetchUsers = createAsyncThunk(
    "user/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(AUTH_USERS_URL);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch users");
        }
    }
);

export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`${AUTH_USERS_URL}/${id}`);
            toast.success("User deleted successfully");
            return id;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete user";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (user, { rejectWithValue }) => {
        try {
            const res = await api.put(`${AUTH_USERS_URL}/${user.id}`, user);
            toast.success("User updated successfully");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update user";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const createUser = createAsyncThunk(
    "user/createUser",
    async (user, { rejectWithValue }) => {
        try {
            const res = await api.post(AUTH_USERS_URL, user);
            toast.success("User created successfully");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to create user";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const approveUser = createAsyncThunk(
    "user/approveUser",
    async ({ id, priceMarkup }, { rejectWithValue }) => {
        try {
            const res = await api.put(`${AUTH_USERS_URL}/approve/${id}`, { priceMarkup });
            toast.success("User approved successfully and email sent!");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to approve user";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const toggleApiAccess = createAsyncThunk(
    "user/toggleApiAccess",
    async ({ id, isApiOpen }, { rejectWithValue }) => {
        try {
            const res = await api.put(`${AUTH_USERS_URL}/toggle-api/${id}`, { isApiOpen });
            toast.success(res.data.message);
            return res.data.user;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to toggle API access";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const clearSessions = createAsyncThunk(
    "user/clearSessions",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.put(`${AUTH_USERS_URL}/clear-sessions/${id}`);
            toast.success("All sessions cleared for this user");
            return res.data.user;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to clear sessions";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map((user) =>
                    user._id === action.payload._id ? action.payload : user
                );
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = [...state.users, action.payload];
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map((user) =>
                    String(user._id) === String(action.payload.user?._id || action.payload._id) ? (action.payload.user || action.payload) : user
                );
            })
            .addCase(approveUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleApiAccess.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map((user) =>
                    user._id === action.payload._id ? action.payload : user
                );
            })
            .addCase(clearSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map((user) =>
                    user._id === action.payload._id ? action.payload : user
                );
            })
            .addCase(clearSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;
