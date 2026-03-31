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



module.exports = {
    getInventoryApis,
    createInventoryApi,
    updateInventoryApi,
    deleteInventoryApi
};
