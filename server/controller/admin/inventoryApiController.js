const InventoryApi = require("../../models/InventoryApi");

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

// Create a new inventory API
const createInventoryApi = async (req, res) => {
    try {
        const { url, method, body, headers, isActive } = req.body;
        const newApi = new InventoryApi({ url, method, body, headers, isActive });
        await newApi.save();
        res.status(201).json({ success: true, data: newApi });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an inventory API
const updateInventoryApi = async (req, res) => {
    try {
        const { id } = req.params;
        const { url, method, body, headers, isActive } = req.body;
        const updatedApi = await InventoryApi.findByIdAndUpdate(
            id,
            { url, method, body, headers, isActive },
            { new: true }
        );



        if (!updatedApi) {
            return res.status(404).json({ success: false, message: "API not found" });
        }
        res.status(200).json({ success: true, data: updatedApi });
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
        const validUrls = allApis.map(api => api.url);

        // Delete diamonds whose Source is not in the list of valid API URLs
        const result = await Diamond.deleteMany({ Source: { $nin: validUrls } });
        console.log(`[CLEANUP] Physically removed ${result.deletedCount} orphaned diamonds from Database.`);
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
