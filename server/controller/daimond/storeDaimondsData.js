const axios = require("axios");
const Diamond = require("../../models/Diamond");

const storeDaimond = async (req, res) => {
    try {
        console.log("[API_SYNC_PUBLIC] Fetching from Akshar API (POST)...");
        const response = await axios.post("https://akshar.kodllin.com/apis/api/getStockN?auth_key=zvkwybd3mqru");

        const rawData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data.data)
                ? response.data.data
                : [];

        if (rawData.length === 0) {
            return res.status(200).json({ success: true, message: "No diamonds found", inserted: 0 });
        }

        // 1. Mandatory Clear
        await Diamond.deleteMany({});

        // 2. Comprehensive Mapping
        const items = rawData.map((item) => ({
            Stock_ID: item.stockNo,
            Stock: item.stockNo,
            Shape: item.shape,
            Weight: Number(item.weight) || 0,
            Color: item.color,
            Clarity: item.clarity,
            Cut: item.cut,
            Polish: item.polish,
            Symmetry: item.symmetry,
            Lab: item.lab,
            Report: item.reportNo,
            Final_Price: Number(item.totalPrice) || 0,
            Price_Per_Carat: Number(item.pricePerCt) || 0,
            Diamond_Image: item.imageLink,
            Diamond_Video: item.videoLink,
            Certificate_Image: item.certiFile,
            Availability: item.status || "In Stock",
            Measurements: item.measurements,
            Depth: item.depth,
            table_name: item.table,
            Girdle: item.girdleThin && item.girdleThick ? `${item.girdleThin}-${item.girdleThick}` : (item.girdleThin || item.girdleThick || ""),
            Crown: item.crownHeight,
            Pavilion: item.pavilionDepth,
            Culet: item.culetSize,
            Ratio: item.ratio,
            Fluorescence: item.fluorescenceIntensity,
            Bgm: item.milky,
            Growth_Type: item.growthType,
            Location: item.location,
            Source: "API",
            ...item
        })).filter(i => i.Stock_ID);

        const result = await Diamond.insertMany(items, { ordered: false });

        res.status(200).json({
            success: true,
            inserted: result.length,
            message: "Database cleared and re-synced with Akshar API."
        });
    } catch (error) {
        console.error("Error storing diamonds:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { storeDaimond };
