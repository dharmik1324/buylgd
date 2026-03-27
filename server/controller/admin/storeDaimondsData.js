const axios = require("axios");
const Diamond = require("../../models/Diamond");
const csv = require("csv-parser");
const fs = require("fs");

const storeDaimond = async (req, res) => {
    try {
        console.log("[API_SYNC] Fetching data from Akshar API (POST)...");
        const response = await axios.post("https://akshar.kodllin.com/apis/api/getStockN?auth_key=zvkwybd3mqru");

        const rawData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data.data)
                ? response.data.data
                : [];

        if (rawData.length === 0) {
            return res.status(200).json({ success: true, message: "No diamonds found from API", inserted: 0 });
        }

        // 1. DELETE ALL OLD DATA (Mandatory as requested)
        console.log("[API_SYNC] Removing all existing data from database...");
        await Diamond.deleteMany({});

        // 2. Comprehensive Field Mapping for both Inventory and Details View
        const items = rawData.map((item) => ({
            Stock_ID: item.stockNo,
            Stock: item.stockNo,               // Used by Detail View
            Shape: item.shape,                 // Used by Filters/Inventory
            Weight: Number(item.weight) || 0,  // Used by Filters/Inventory
            Color: item.color,                 // Used by Filters/Inventory
            Clarity: item.clarity,             // Used by Filters/Inventory
            Cut: item.cut,                     // Used by Filters/Inventory
            Polish: item.polish,               // Used by Detail View
            Symmetry: item.symmetry,           // Used by Detail View
            Lab: item.lab,                     // Used by Detail View
            Report: item.reportNo,             // Used by Detail View
            Final_Price: Number(item.totalPrice) || 0, // Used by Inventory/Markup
            Price_Per_Carat: Number(item.pricePerCt) || 0,
            Diamond_Image: item.imageLink,     // Used by Inventory/Detail
            Diamond_Video: item.videoLink,     // Used by Detail View
            Certificate_Image: item.certiFile, // Used by Detail View
            Availability: item.status || "In Stock",
            Measurements: item.measurements,   // Used by Detail View
            Depth: item.depth,                 // Used by Detail View
            table_name: item.table,            // Used by Detail View (Frontend expects table_name)
            Girdle: item.girdleThin && item.girdleThick ? `${item.girdleThin}-${item.girdleThick}` : (item.girdleThin || item.girdleThick || ""),
            Crown: item.crownHeight,           // Used by Detail View
            Pavilion: item.pavilionDepth,       // Used by Detail View
            Culet: item.culetSize,             // Used by Detail View
            Ratio: item.ratio,                 // Used by Detail View
            Fluorescence: item.fluorescenceIntensity,
            Milky: item.milky,
            Bgm: item.milky,                   // Used by Detail View
            Growth_Type: item.growthType,      // Used by Detail View
            Treatment: item.treatment,
            Location: item.location,
            Source: "API",
            ...item // Preserve original data
        })).filter(item => item.Stock_ID);

        console.log(`[API_SYNC] Cleaned DB. Inserting ${items.length} new records...`);

        // 3. Bulk Insert
        const result = await Diamond.insertMany(items, { ordered: false });

        res.status(200).json({
            success: true,
            total: items.length,
            inserted: result.length,
            message: `Successfully replaced everything with ${result.length} diamonds from Akshar API.`
        });

    } catch (error) {
        console.error("Error storing diamonds:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const uploadCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        console.log(`[CSV_UPLOAD] Starting processing: ${req.file.path}`);
        let totalProcessed = 0;
        let batch = [];
        const BATCH_SIZE = 1000;
        let isResponseSent = false;

        const processBatch = async (items) => {
            if (items.length === 0) return;

            const ops = items.map(item => {
                // Expanded list of possible ID column names based on the CSV
                const stockId = item.Stock_ID || item.Stock || item.stock_id ||
                    item.Stock_No || item.stock_no ||
                    item["Lab Report No"] || item["Lab_Report_No"] ||
                    item.SRNO;

                // Prepare the diamond object
                const { _id, ...cleanData } = item;
                return {
                    updateOne: {
                        filter: { Stock_ID: stockId },
                        update: { $set: { ...cleanData, Stock_ID: stockId, Source: "CSV" } },
                        upsert: true
                    }
                };
            }).filter(op => op.updateOne.filter.Stock_ID);

            if (ops.length > 0) {
                await Diamond.bulkWrite(ops, { ordered: false });
                totalProcessed += ops.length;
                console.log(`[CSV_UPLOAD] Processed ${totalProcessed} records...`);
            }
        };

        const stream = fs.createReadStream(req.file.path).pipe(csv());

        stream.on("data", async (data) => {
            batch.push(data);
            if (batch.length >= BATCH_SIZE) {
                stream.pause(); // Stop reading from file
                await processBatch(batch);
                batch = []; // Clear batch
                stream.resume(); // Continue reading
            }
        });

        stream.on("end", async () => {
            try {
                // Process remaining records
                await processBatch(batch);

                // Cleanup file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                console.log(`[CSV_UPLOAD] ✅ Finished! Total processed: ${totalProcessed}`);

                if (!isResponseSent) {
                    isResponseSent = true;
                    res.status(200).json({
                        success: true,
                        totalInserted: totalProcessed,
                        message: `Successfully processed ${totalProcessed} diamonds.`
                    });
                }
            } catch (err) {
                console.error("Error in CSV end handler:", err);
                if (!isResponseSent) {
                    isResponseSent = true;
                    res.status(500).json({ success: false, error: err.message });
                }
            }
        });

        stream.on("error", (error) => {
            console.error("Stream Error:", error);
            if (!isResponseSent) {
                isResponseSent = true;
                res.status(500).json({ success: false, error: error.message });
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const clearInventory = async (req, res) => {
    try {
        const result = await Diamond.deleteMany({ Source: "CSV" });
        res.status(200).json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Inventory cleared. Removed ${result.deletedCount} CSV-imported records. API data was preserved.`,
        });
    } catch (error) {
        console.error("Error clearing inventory:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { storeDaimond, uploadCsv, clearInventory };
