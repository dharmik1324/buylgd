import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import { toast } from "react-toastify";

const ADMIN_URL = "/admin/diamonds";

export const syncInventory = createAsyncThunk(
  "diamonds/syncInventory",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/admin/inventory-api/sync");
      toast.success(res.data.message || `Inventory sync started.`);
      // We don't dispatch fetchDiamonds here anymore, 
      // we rely on the finished sync to trigger a refresh or let the user refresh
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Sync failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchSyncStatus = createAsyncThunk(
  "diamonds/fetchSyncStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/inventory-api/sync-status");
      return res.data.isSyncing;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const importInventoryFromCSV = createAsyncThunk(
  "diamonds/importInventoryFromCSV",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/admin/csv-diamonds/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message || `Inventory updated successfully.`);
      dispatch(fetchDiamonds({ page: 1, limit: 12 })); // Refresh first page
      dispatch(fetchImportedFiles()); // Refresh file list
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "CSV Import failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchImportedFiles = createAsyncThunk(
  "diamonds/fetchImportedFiles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/csv-diamonds/files");
      return res.data.files;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch files";
      return rejectWithValue(message);
    }
  }
);

export const clearByCSV = createAsyncThunk(
  "diamonds/clearByCSV",
  async (filename, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete("/admin/csv-diamonds/clear-by-file", {
        params: { filename }
      });
      toast.success(res.data.message || `Removed diamonds from ${filename}`);
      dispatch(fetchDiamonds({ page: 1, limit: 12 })); // Refresh first page
      dispatch(fetchImportedFiles()); // Refresh file list
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to clear CSV";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const clearInventory = createAsyncThunk(
  "diamonds/clearInventory",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete("/admin/csv-diamonds/clear");
      toast.success(res.data.message || "Inventory completely cleared.");
      dispatch(fetchDiamonds({ page: 1, limit: 12 })); // Refresh first page
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to clear inventory";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


export const fetchDiamonds = createAsyncThunk(
  "diamonds/fetchDiamonds",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ADMIN_URL, { params });
      const p = res.data.pagination || {};
      return {
        data: res.data.data,
        pagination: {
          currentPage: p.currentPage || 1,
          totalPages: p.totalPages || 1,
          totalDiamonds: p.totalDiamonds ?? 0,
          limit: p.limit || 12
        },
        metadata: res.data.metadata,
        page: Number(params.page) || 1,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch diamonds";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchPublicDiamonds = createAsyncThunk(
  "diamonds/fetchPublicDiamonds",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory", { params });
      const p = res.data.pagination || {};
      return {
        data: res.data.data,
        pagination: {
          currentPage: p.currentPage ?? res.data.currentPage ?? 1,
          totalPages: p.totalPages ?? res.data.totalPages ?? 1,
          totalDiamonds: p.totalDiamonds ?? res.data.total ?? 0,
          limit: p.limit ?? params.limit ?? 12
        },
        metadata: res.data.metadata,
        page: Number(params.page) || 1,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch public inventory";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteDiamond = createAsyncThunk(
  "diamonds/deleteDiamond",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${ADMIN_URL}/${id}`);
      toast.success("Diamond deleted successfully");
      return id;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete diamond";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateDiamond = createAsyncThunk(
  "diamonds/updateDiamond",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${ADMIN_URL}/${id}`, formData);
      toast.success("Diamond updated successfully");
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update diamond";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addDiamond = createAsyncThunk(
  "diamonds/addDiamond",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(ADMIN_URL, formData);
      toast.success("Diamond added successfully");
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add diamond";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const bulkUpdateDiamonds = createAsyncThunk(
  "diamonds/bulkUpdate",
  async ({ filter, update }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`${ADMIN_URL}/bulk-update`, { filter, update });
      dispatch(fetchDiamonds({ page: 1, limit: 12, search: filter.search, ...filter }));
      toast.success("Bulk update successful");
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Bulk update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const holdDiamond = createAsyncThunk(
  "diamonds/holdDiamond",
  async ({ id, userId, days, hours }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${ADMIN_URL}/hold/${id}`, { userId, days, hours });
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to hold diamond";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const releaseHold = createAsyncThunk(
  "diamonds/releaseHold",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${ADMIN_URL}/release-hold/${id}`);
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to release hold";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchHeldDiamonds = createAsyncThunk(
  "diamonds/fetchHeldDiamonds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${ADMIN_URL}/held`);
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch held diamonds";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const diamondSlice = createSlice({
  name: "diamonds",
  initialState: {
    data: [],
    heldDiamonds: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalDiamonds: 0,
    limit: 10,
    isSyncing: false,
    importedFiles: [],
    metadata: {
      shapes: [],
      colors: [],
      clarities: [],
      priceMin: 500,
      priceMax: 20000,
      caratMin: 0.1,
      caratMax: 5,
      hasCarat: true,
    },
    currentFilters: {
      shapes: [],
      colors: [],
      clarities: [],
      cuts: [],
      priceMin: 500,
      priceMax: 20000,
      caratMin: 0.1,
      caratMax: 5,
      search: "",
    }
  },
  reducers: {
    resetDiamonds: (state) => {
      state.data = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalDiamonds = 0;
      state.error = null;
      state.loading = false;
    },
    updateHoldRealtime: (state, action) => {
      const updatedDiamond = action.payload;
      state.data = state.data.map((d) => (d._id === updatedDiamond._id ? updatedDiamond : d));
      if (updatedDiamond.onHold) {
        const index = state.heldDiamonds.findIndex(d => d._id === updatedDiamond._id);
        if (index !== -1) {
          state.heldDiamonds[index] = updatedDiamond;
        } else {
          state.heldDiamonds.unshift(updatedDiamond);
        }
      }
    },
    releaseHoldRealtime: (state, action) => {
      const diamondId = action.payload;
      state.data = state.data.map((d) => {
        if (d._id === diamondId) {
          return { ...d, onHold: false, holdBy: null, holdExpiresAt: null, Availability: "In Stock" };
        }
        return d;
      });
      state.heldDiamonds = state.heldDiamonds.filter(d => d._id !== diamondId);
    },
    setCurrentFilters: (state, action) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiamonds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicDiamonds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiamonds.fulfilled, (state, action) => {
        const { data, pagination, page, metadata } = action.payload;
        if (page === 1) {
          state.data = data;
        } else {
          state.data = [...state.data, ...data];
        }
        state.currentPage = pagination.currentPage;
        state.totalPages = pagination.totalPages;
        state.totalDiamonds = pagination.totalDiamonds;
        state.limit = pagination.limit;
        if (metadata) {
          state.metadata = { ...state.metadata, ...metadata };
        }
        state.loading = false;
      })
      .addCase(fetchPublicDiamonds.fulfilled, (state, action) => {
        const { data, pagination, page, metadata } = action.payload;
        if (page === 1) {
          state.data = data;
        } else {
          state.data = [...state.data, ...data];
        }
        state.currentPage = pagination.currentPage;
        state.totalPages = pagination.totalPages;
        state.totalDiamonds = pagination.totalDiamonds;
        state.limit = pagination.limit;
        if (metadata) {
          state.metadata = { ...state.metadata, ...metadata };
        }
        state.loading = false;
      })
      .addCase(fetchDiamonds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPublicDiamonds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHeldDiamonds.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHeldDiamonds.fulfilled, (state, action) => {
        state.heldDiamonds = action.payload;
        state.loading = false;
      })
      .addCase(fetchHeldDiamonds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDiamond.fulfilled, (state, action) => {
        state.data = state.data.filter((d) => d._id !== action.payload);
        state.totalDiamonds = Math.max(state.totalDiamonds - 1, 0);
        state.loading = false;
      })
      .addCase(updateDiamond.fulfilled, (state, action) => {
        state.data = state.data.map((d) => (d._id === action.payload._id ? action.payload : d));
        state.loading = false;
      })
      .addCase(addDiamond.fulfilled, (state, action) => {
        state.data = [action.payload, ...state.data];
        state.totalDiamonds += 1;
        state.loading = false;
      })
      .addCase(holdDiamond.fulfilled, (state, action) => {
        state.data = state.data.map((d) => (d._id === action.payload._id ? action.payload : d));
        state.loading = false;
      })
      .addCase(releaseHold.fulfilled, (state, action) => {
        state.data = state.data.map((d) => (d._id === action.payload._id ? action.payload : d));
        state.heldDiamonds = state.heldDiamonds.filter(d => d._id !== action.payload._id);
        state.loading = false;
      })
      .addCase(syncInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncInventory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncInventory.rejected, (state) => {
        state.loading = false;
      })
      .addCase(importInventoryFromCSV.pending, (state) => {
        state.loading = true;
      })
      .addCase(importInventoryFromCSV.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(importInventoryFromCSV.rejected, (state) => {
        state.loading = false;
      })
      .addCase(clearInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearInventory.fulfilled, (state) => {
        state.loading = false;
        state.data = []; // instantly clear ui
        state.totalDiamonds = 0;
      })
      .addCase(clearInventory.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchImportedFiles.fulfilled, (state, action) => {
        state.importedFiles = action.payload;
      })
      .addCase(clearByCSV.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearByCSV.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(clearByCSV.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.isSyncing = action.payload;
      });
  },
});

export const { resetDiamonds, updateHoldRealtime, releaseHoldRealtime, setCurrentFilters } = diamondSlice.actions;
export default diamondSlice.reducer;
