import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";

const API_URL = "/admin/inventory-api/apis";

export const fetchInventoryApis = createAsyncThunk(
    "inventoryApi/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(API_URL);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch APIs");
        }
    }
);

export const createInventoryApi = createAsyncThunk(
    "inventoryApi/create",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post(API_URL, formData);
            toast.success(res.data.message || "API added and sync started");
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add API");
            return rejectWithValue(err.response?.data?.message || "Failed to add API");
        }
    }
);

export const updateInventoryApi = createAsyncThunk(
    "inventoryApi/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await api.put(`${API_URL}/${id}`, formData);
            toast.success(res.data.message || "API updated and sync started");
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update API");
            return rejectWithValue(err.response?.data?.message || "Failed to update API");
        }
    }
);

export const deleteInventoryApi = createAsyncThunk(
    "inventoryApi/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`${API_URL}/${id}`);
            toast.success("API configuration deleted");
            return id;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete API");
            return rejectWithValue(err.response?.data?.message || "Failed to delete API");
        }
    }
);
export const testInventoryApi = createAsyncThunk(
    "inventoryApi/test",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post("/admin/inventory-api/test", formData);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to test API");
        }
    }
);

const inventoryApiSlice = createSlice({
    name: "inventoryApi",
    initialState: {
        apis: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventoryApis.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInventoryApis.fulfilled, (state, action) => {
                state.loading = false;
                state.apis = action.payload;
            })
            .addCase(fetchInventoryApis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createInventoryApi.fulfilled, (state, action) => {
                state.apis.unshift(action.payload);
            })
            .addCase(updateInventoryApi.fulfilled, (state, action) => {
                state.apis = state.apis.map(api => api._id === action.payload._id ? action.payload : api);
            })
            .addCase(deleteInventoryApi.fulfilled, (state, action) => {
                state.apis = state.apis.filter(api => api._id !== action.payload);
            });
    }
});

export default inventoryApiSlice.reducer;
