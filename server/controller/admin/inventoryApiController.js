const InventoryApi = require("../../models/InventoryApi");
const { syncInventoryFromApis } = require("../../utils/diamondSync");

// Get all inventory APIs
const getInventoryApis = async (req, res) => {
    try {
        // Run cleanup on fetch to ensure DB integrity
        await cleanupOrphanedDiamonds();
        
        const apis = await InventoryApi.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: apis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new inventory inventory API
const createInventoryApi = async (req, res) => {
    try {
        const { name, url, method, body, headers, isActive } = req.body;
        const newApi = new InventoryApi({ name, url, method, body, headers, isActive });
        await newApi.save();

        // Automatically trigger sync in the background
        console.log(`[API_CONFIG] New API added: ${name} (${url}). Triggering background sync...`);
        syncInventoryFromApis().catch(err => {
            console.error("[API_CONFIG] Background sync failed after creation:", err.message);
        });

        res.status(201).json({ 
            success: true, 
            data: newApi, 
            message: `API '${name}' added successfully. Synchronization is running in the background.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an inventory API
const updateInventoryApi = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, method, body, headers, isActive } = req.body;
        const updatedApi = await InventoryApi.findByIdAndUpdate(
            id,
            { name, url, method, body, headers, isActive },
            { new: true }
        );

        if (!updatedApi) {
            return res.status(404).json({ success: false, message: "API not found" });
        }

        // Automatically trigger sync in the background
        console.log(`[API_CONFIG] API updated: ${name} (${url}). Triggering background sync...`);
        syncInventoryFromApis().catch(err => {
            console.error("[API_CONFIG] Background sync failed after update:", err.message);
        });

        res.status(200).json({ 
            success: true, 
            data: updatedApi, 
            message: `API updated successfully. Synchronization is running in the background.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to cleanup orphaned diamonds physically from DB
const cleanupOrphanedDiamonds = async () => {
    try {
        const InventoryApi = require("../../models/InventoryApi");
        const Diamond = require("../../models/Diamond");
        
        // Fetch all legitimate URLs (active or inactive)
        const allApis = await InventoryApi.find().select('url');
        const validUrls = allApis.map(api => api.url.trim());

        // We only cleanup IF there are APIs defined. 
        // We MUST NOT delete "CSV" sourced diamonds as they are independent.
        const query = { 
            Source: { $nin: [...validUrls, "CSV"] } 
        };

        const result = await Diamond.deleteMany(query);
        if (result.deletedCount > 0) {
            console.log(`[CLEANUP] Physically removed ${result.deletedCount} orphaned diamonds from Database.`);
        }
    } catch (err) {
        console.error("[CLEANUP] Error during orphan cleanup:", err.message);
    }
};

// Delete an inventory API
const deleteInventoryApi = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find configuration first to get the URL
        const apiToDelete = await InventoryApi.findById(id);
        if (!apiToDelete) {
             return res.status(404).json({ success: false, message: "API not found" });
        }

        // 1. Physically delete API configuration
        await InventoryApi.findByIdAndDelete(id);

        // 2. Physically cleanup ALL orphaned data (including this one's)
        await cleanupOrphanedDiamonds();

        res.status(200).json({ success: true, message: "API and all associated orphaned data physically removed from DB." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Test an API configuration without saving or syncing
const testFetch = async (req, res) => {
    try {
        const { url, method, body, headers } = req.body;
        if (!url) return res.status(400).json({ success: false, message: "URL is required" });

        const axios = require("axios");
        const { parseConfigString } = require("../../utils/diamondSync");

        const configHeaders = parseConfigString(headers);
        const configBody = parseConfigString(body);

        let response;
        if (method === "POST") {
            response = await axios.post(url, configBody, { headers: configHeaders, timeout: 15000 });
        } else {
            response = await axios.get(url, { params: configBody, headers: configHeaders, timeout: 15000 });
        }

        // Try to locate data in the response
        let rawData = response.data;
        let dataToSample = Array.isArray(rawData) ? rawData : (rawData.data || rawData.diamonds || rawData.stock || []);
        
        if (!Array.isArray(dataToSample) && typeof dataToSample === 'object') {
             // Deep search for first array
             for (let key in dataToSample) {
                 if (Array.isArray(dataToSample[key])) {
                     dataToSample = dataToSample[key];
                     break;
                 }
             }
        }

        res.status(200).json({ 
            success: true, 
            count: Array.isArray(dataToSample) ? dataToSample.length : 0,
            sample: Array.isArray(dataToSample) ? dataToSample.slice(0, 3) : [],
            fullResponse: typeof rawData === 'object' ? JSON.stringify(rawData).substring(0, 1000) : String(rawData).substring(0, 1000)
        });
    } catch (error) {
        res.status(200).json({ 
            success: false, 
            message: error.message,
            details: error.response?.data ? JSON.stringify(error.response.data).substring(0, 500) : "No details available"
        });
    }
};

const triggerManualSync = async (req, res) => {
    try {
        console.log("[API_SYNC] Manual sync requested via admin. Triggering background sync...");
        
        const { syncInventoryFromApis } = require("../../utils/diamondSync");

        // We trigger it asynchronously to avoid blocking the response
        syncInventoryFromApis().then(result => {
             console.log(`[API_SYNC] Manual background sync completed: ${result.count} items.`);
        }).catch(err => {
             console.error("[API_SYNC] Manual background sync failed:", err.message);
        });

        res.status(200).json({ 
            success: true, 
            message: "Background synchronization started. Please check back in a few minutes." 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSyncStatus = async (req, res) => {
    try {
        const { getSyncStatus: getStatus } = require("../../utils/diamondSync");
        res.status(200).json({ success: true, isSyncing: getStatus() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInventoryApis,
    createInventoryApi,
    updateInventoryApi,
    deleteInventoryApi,
    testFetch,
    triggerManualSync,
    getSyncStatus
};
