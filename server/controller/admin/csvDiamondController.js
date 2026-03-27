const CsvDiamond = require("../../models/CsvDiamond");
const csv = require("csv-parser");
const fs = require("fs");

/**
 * Handle CSV Upload for the dedicated CSV collection
 */
const uploadCsvToDedicate = async (req, res) => {
    req.setTimeout(600000); 

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "Please select one or more valid CSV files." });
        }

        let totalImported = 0;
        const results = [];

        for (const file of req.files) {
            console.log(`[CSV_IMPORT] Started processing: ${file.originalname}`);
            
            let totalRecords = 0;
            let batch = [];
            const BATCH_SIZE = 1500;
            let hasLoggedFirstRow = false;

            const processBatch = async (items, filename) => {
                if (items.length === 0) return;
                const ops = items.map(item => {
                    // Normalize keys (trim whitespace and handle BOM)
                    const cleanItem = {};
                    Object.keys(item).forEach(key => {
                        const cleanKey = key.trim().replace(/^\uFEFF/, ""); 
                        cleanItem[cleanKey] = item[key];
                    });

                    if (!hasLoggedFirstRow) {
                        console.log(`[CSV_IMPORT] First Row Detected for ${filename}:`, cleanItem);
                        hasLoggedFirstRow = true;
                    }

                    // Try various Stock ID combinations
                    const stockId = cleanItem.Stock_ID || cleanItem.Stock || cleanItem.stock_id || 
                                  cleanItem.Stock_No || cleanItem.stock_no || 
                                  cleanItem["Stock No"] || cleanItem["STOCK NO"] ||
                                  cleanItem["Lab Report No"] || cleanItem["Lab_Report_No"] || 
                                  cleanItem.SRNO || cleanItem.id || cleanItem.ID;

                    // Try to find price if not explicitly named 'Price'
                    if (!cleanItem.Price) {
                        cleanItem.Price = cleanItem.Final_Price || cleanItem.price || cleanItem.Amount || cleanItem.Total;
                    }
                    
                    // Try to find weight
                    if (!cleanItem.Weight) {
                        cleanItem.Weight = cleanItem.Carat || cleanItem.carat || cleanItem.weight || cleanItem.Size;
                    }

                    const { _id, ...finalData } = cleanItem;
                    return {
                        updateOne: {
                            filter: { Stock_ID: String(stockId) },
                            update: { $set: { ...finalData, Stock_ID: String(stockId), csv_filename: filename } },
                            upsert: true
                        }
                    };
                }).filter(op => op.updateOne.filter.Stock_ID && op.updateOne.filter.Stock_ID !== "undefined" && op.updateOne.filter.Stock_ID !== "null");

                if (ops.length > 0) {
                    await CsvDiamond.bulkWrite(ops, { ordered: false });
                    totalRecords += ops.length;
                }
            };

            // Wrap stream processing in a promise so we can await it for each file
            await new Promise((resolve, reject) => {
                const stream = fs.createReadStream(file.path).pipe(csv({
                    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, "")
                }));

                stream.on("data", async (data) => {
                    batch.push(data);
                    if (batch.length >= BATCH_SIZE) {
                        stream.pause();
                        try {
                            await processBatch(batch, file.originalname);
                            batch = [];
                            stream.resume();
                        } catch (err) {
                            console.error(`[CSV_IMPORT] Batch processing error for ${file.originalname}:`, err);
                            stream.destroy(err);
                        }
                    }
                });

                stream.on("end", async () => {
                    try {
                        if (batch.length > 0) await processBatch(batch, file.originalname);
                        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                        console.log(`[CSV_IMPORT] Completed ${file.originalname}. Total: ${totalRecords}`);
                        totalImported += totalRecords;
                        results.push({ filename: file.originalname, count: totalRecords });
                        resolve();
                    } catch (err) {
                        console.error(`[CSV_IMPORT] Final batch error for ${file.originalname}:`, err);
                        reject(err);
                    }
                });

                stream.on("error", (err) => {
                    console.error(`[CSV_IMPORT] Stream Error for ${file.originalname}:`, err);
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    reject(err);
                });
            });
        }

        res.status(201).json({ 
            success: true, 
            totalImported,
            files: results,
            message: `Successfully imported ${totalImported} diamonds from ${req.files.length} files.` 
        });

    } catch (error) {
        console.error("[CSV_IMPORT] Controller Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Clear only the CSV collection
 */
const clearCsvCollection = async (req, res) => {
    try {
        await CsvDiamond.deleteMany({});
        res.status(200).json({ success: true, message: "Dedicated CSV inventory cleared." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get CSV focused diamonds (for admin list)
 */
const getCsvDiamonds = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const diamonds = await CsvDiamond.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await CsvDiamond.countDocuments();
        res.json({
            data: diamonds,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get list of unique imported CSV filenames
 */
const getImportedFiles = async (req, res) => {
    try {
        const files = await CsvDiamond.distinct("csv_filename");
        // We might want more info like counts, but distinct only gives names
        // Let's get counts for each too
        const fileStats = await CsvDiamond.aggregate([
            { $group: { _id: "$csv_filename", count: { $sum: 1 }, lastImport: { $max: "$updatedAt" } } },
            { $project: { filename: "$_id", count: 1, lastImport: 1, _id: 0 } },
            { $sort: { lastImport: -1 } }
        ]);

        res.status(200).json({ success: true, files: fileStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Delete diamonds by CSV filename
 */
const deleteDiamondsByFile = async (req, res) => {
    try {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ success: false, message: "Filename is required" });
        }

        const result = await CsvDiamond.deleteMany({ csv_filename: filename });
        res.status(200).json({ 
            success: true, 
            message: `Removed ${result.deletedCount} diamonds imported from ${filename}.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { 
    uploadCsvToDedicate, 
    clearCsvCollection, 
    getCsvDiamonds, 
    getImportedFiles, 
    deleteDiamondsByFile 
};
