const Diamond = require("../../models/Diamond");
const User = require("../../models/User");

const getExternalDiamonds = async (req, res) => {
    try {
        const { companyName } = req.params;

        // Find user by companyName (case-insensitive)
        const user = await User.findOne({
            companyName: { $regex: new RegExp(`^${companyName.replace(/-/g, " ")}$`, "i") }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        // Removed isApiOpen check as per new requirements: access is now based solely on companyName


        // API Key validation removed as per new requirements
        // Access is now based solely on companyName in the URL


        // Fetch diamonds based on user's API settings
        const query = { Availability: { $in: ["In Stock", "Available", "IN STOCK", "AVAILABLE"] } };

        // 1. Handle API source filtering
        if (user.allowedApis && user.allowedApis.length > 0) {
            const InventoryApi = require("../../models/InventoryApi");
            const apis = await InventoryApi.find({ _id: { $in: user.allowedApis } });
            const allowedUrls = apis.map(api => api.url.trim());
            
            if (allowedUrls.length > 0) {
                query.Source = { $in: allowedUrls };
            }
        }

        // 2. Handle data filtering mode
        let filtersToApply = {};
        if (user.apiFilterMode === "specific") {
            filtersToApply = user.apiFilters || {};
        }

        const f = filtersToApply;

        // Helper to process filters (handles single string, comma-separated string, or array)
        const applyMultiSelectFilter = (field, value) => {
            if (!value) return;
            let values = [];
            if (Array.isArray(value)) {
                values = value;
            } else if (typeof value === 'string') {
                values = value.split(",").map(v => v.trim()).filter(Boolean);
            }
            if (values.length > 0) {
                query[field] = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
            }
        };

        // Helper to process range filters
        const applyRangeFilter = (field, min, max) => {
            if (min !== undefined && min !== null && min !== "") {
                query[field] = query[field] || {};
                query[field].$gte = Number(min);
            }
            if (max !== undefined && max !== null && max !== "") {
                query[field] = query[field] || {};
                query[field].$lte = Number(max);
            }
        };

        // Apply Multi-select Filters
        applyMultiSelectFilter("Shape", f.shapes);
        applyMultiSelectFilter("Color", f.colors);
        applyMultiSelectFilter("Clarity", f.clarities);
        applyMultiSelectFilter("Cut", f.cuts);
        applyMultiSelectFilter("Polish", f.polish);
        applyMultiSelectFilter("Symmetry", f.symmetry);
        applyMultiSelectFilter("Location", f.location);

        // Apply Range Filters
        applyRangeFilter("Final_Price", f.priceMin, f.priceMax);
        applyRangeFilter("Weight", f.caratMin, f.caratMax);
        applyRangeFilter("table_name", f.tableMin, f.tableMax);
        applyRangeFilter("Depth", f.depthMin, f.depthMax);

        // Apply Search (if any)
        if (f.search && f.search.trim()) {
            query.$or = [
                { Shape: { $regex: f.search.trim(), $options: "i" } },
                { Lab: { $regex: f.search.trim(), $options: "i" } },
                { Stock_ID: { $regex: f.search.trim(), $options: "i" } },
                { Stock_No: { $regex: f.search.trim(), $options: "i" } },
                { Certificate_No: { $regex: f.search.trim(), $options: "i" } }
            ];
        }

        const diamonds = await Diamond.find(query).limit(500).lean();

        // Apply price increment/decrement based on apiPriceAdjustment
        let finalData = diamonds;
        const adjustment = user.apiPriceAdjustment || 0;

        if (adjustment !== 0) {
            const multiplier = 1 + (adjustment / 100);
            finalData = diamonds.map(d => ({
                ...d,
                Final_Price: d.Final_Price ? Number((d.Final_Price * multiplier).toFixed(2)) : d.Final_Price
            }));
        }

        res.status(200).json({
            success: true,
            company: user.companyName,
            apiFilterMode: user.apiFilterMode,
            appliedFilters: f,
            queryExecuted: query, // Helpful for debugging
            priceAdjustmentApplied: `${adjustment > 0 ? '+' : ''}${adjustment}%`,
            total: finalData.length,
            data: finalData
        });

    } catch (error) {
        console.error("External API Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getExternalDiamonds };
