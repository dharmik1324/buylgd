import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const getStoredUser = () => {
    const storedUser = Cookies.get("user");
    if (!storedUser || storedUser === "undefined") return null;
    try {
        return JSON.parse(storedUser);
    } catch (err) {
        Cookies.remove("user");
        return null;
    }
};

const getStoredToken = () => {
    return Cookies.get("token") || null;
};


export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            const res = await api.post("/auth/register", userData);

            if (res.data.token) {
                Cookies.set("token", res.data.token, {
                    expires: 7,
                    secure: true,
                    sameSite: "strict",
                });
            }

            if (res.data.user) {
                Cookies.set("user", JSON.stringify(res.data.user), {
                    expires: 7,
                });
            }

            toast.success("Registration successful!");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Registration failed";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData, { rejectWithValue }) => {
        try {
            const res = await api.post("/auth/login", userData);

            if (res.data.token) {
                Cookies.set("token", res.data.token, {
                    expires: 7,
                    secure: true,
                    sameSite: "strict",
                });
            }

            if (res.data.user) {
                Cookies.set("user", JSON.stringify(res.data.user), {
                    expires: 7,
                });
            }

            toast.success("Login successful!");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Invalid credentials";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const getUserDetails = createAsyncThunk(
    "auth/getUserDetails",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/auth/me");
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch user details"
            );
        }
    }
);

// update current user's profile (name, email, preferredDiamondType, etc.)
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (payload, { rejectWithValue }) => {
        try {
            const id = payload._id || payload.id;
            const res = await api.put(`/auth/users/${id}`, payload);

            // persist updated user in cookie
            if (res.data) {
                Cookies.set("user", JSON.stringify(res.data), { expires: 7 });
            }

            toast.success("Profile updated successfully!");
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update profile";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
            dispatch(logout());
            return true;
        } catch (err) {
            // Even if server call fails, we should clear local state
            dispatch(logout());
            return rejectWithValue(err.response?.data?.message || "Logout failed");
        }
    }
);


const initialState = {
    user: getStoredUser(),
    token: getStoredToken(),
    loading: false,
    error: null,
};


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            Cookies.remove("token");
            Cookies.remove("user");
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getUserDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getUserDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // updateProfile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
