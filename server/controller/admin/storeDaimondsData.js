const axios = require("axios");
const Diamond = require("../../models/Diamond");
const InventoryApi = require("../../models/InventoryApi");
const csv = require("csv-parser");
const fs = require("fs");

const { syncInventoryFromApis } = require("../../utils/diamondSync");

const storeDaimond = async (req, res) => {
    try {
        console.log("[API_SYNC] Starting inventory replacement from active APIs...");
        const result = await syncInventoryFromApis();

        res.status(200).json({
            success: true,
            total: result.count,
            inserted: result.count,
            message: `Successfully synchronized ${result.count} diamonds from ${result.apiCount} APIs.`
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
