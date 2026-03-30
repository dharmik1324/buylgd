const axios = require("axios");
const Diamond = require("../../models/Diamond");
const InventoryApi = require("../../models/InventoryApi");
const csv = require("csv-parser");
const fs = require("fs");

const storeDaimond = async (req, res) => {
    try {
        const activeApis = await InventoryApi.find({ isActive: true });
        
        let allDiamonds = [];

        // Smart parser to handle both JSON and plain-text "key=value" or "key: value"
        const parseConfigString = (str) => {
            if (!str) return {};
            try {
                return JSON.parse(str);
            } catch (e) {
                // Not valid JSON, try to parse line by line "key = value" or "key: value"
                const obj = {};
                const lines = str.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;
                    
                    // Match key-value split by either '=' or ':'
                    const match = line.match(/^([^=:]+)[=:](.+)$/);
                    if (match) {
                        let key = match[1].trim();
                        let value = match[2].trim();
                        // Strip quotes if user added them
                        if ((value.startsWith("'") && value.endsWith("'")) || 
                            (value.startsWith('"') && value.endsWith('"')) ||
                            (value.startsWith('“') && value.endsWith('”'))) {
                            value = value.substring(1, value.length - 1);
                        }
                        obj[key] = value;
                    }
                }
                return obj;
            }
        };

        for (const apiConfig of activeApis) {
            try {
                console.log(`[API_SYNC] Fetching from ${apiConfig.url} (${apiConfig.method})...`);
                let response;
                
                // Prepare request data from body string (assumed to be JSON)
                let requestBody = parseConfigString(apiConfig.body);

                // Prepare headers
                let requestHeaders = parseConfigString(apiConfig.headers);

                if (apiConfig.method === "POST") {
                    try {
                        response = await axios.post(apiConfig.url, requestBody, { headers: requestHeaders });
                    } catch (initialError) {
                        // Fallback: If JSON POST fails (often with 403, 415, or 400 from older Java/PHP APIs like MRM), retry with URL Encoded Form Data
                        if (initialError.response && [403, 400, 415].includes(initialError.response.status)) {
                            console.warn(`[API_SYNC] JSON POST failed for ${apiConfig.url}. Retrying with urlencoded form data...`);
                            const qs = require('qs');
                            const fallbackHeaders = { ...requestHeaders, 'Content-Type': 'application/x-www-form-urlencoded' };
                            response = await axios.post(apiConfig.url, qs.stringify(requestBody), { headers: fallbackHeaders });
                        } else {
                            throw initialError;
                        }
                    }
                } else {
                    response = await axios.get(apiConfig.url, { 
                        params: typeof requestBody === 'object' ? requestBody : {},
                        headers: requestHeaders
                    });
                }

                const findLargestArray = (obj) => {
                    if (Array.isArray(obj)) return obj;
                    if (!obj || typeof obj !== 'object') return [];
                    
                    let largestArray = [];
                    for (const key in obj) {
                        if (Array.isArray(obj[key])) {
                            if (obj[key].length > largestArray.length) {
                                largestArray = obj[key];
                            }
                        } else if (typeof obj[key] === 'object') {
                            const subArray = findLargestArray(obj[key]);
                            if (subArray.length > largestArray.length) {
                                largestArray = subArray;
                            }
                        }
                    }
                    return largestArray;
                };

                const rawData = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : findLargestArray(response.data);

                console.log(`[API_SYNC] ${apiConfig.url} returned ${rawData.length} raw items.`);

                if (rawData.length > 0) {
                    const mappedItems = rawData.map((item, idx) => {
                        const idCandidate = item.stockNo || item.Stock_ID || item.id || item.Ref_No || item.ref_No || item.Stock_No || item.stock_no || item.StockNo;
                        
                        return {
                        ...item, // Put raw data first so our mapped fields override them
                        Stock_ID: idCandidate || `AUTO-${apiConfig._id.toString().substring(0,4)}-${idx}`,
                        Stock: idCandidate || `AUTO-${idx}`,
                        Shape: item.shape || item.Shape || item.ShapeName || item.Shape_Name || "",
                        Weight: Number(item.weight || item.Weight || item.Carat || item.Cts || item.cts) || 0,
                        Color: item.color || item.Color || item.ColorName || item.Color_Name || "",
                        Clarity: item.clarity || item.Clarity || item.ClarityName || item.Clarity_Name || "",
                        Cut: item.cut || item.Cut || item.CutName || item.Cut_Name || "",
                        Polish: item.polish || item.Polish || item.PolishName || item.Polish_Name || "",
                        Symmetry: item.symmetry || item.Symmetry || item.SymmetryName || item.Symmetry_Name || "",
                        Lab: item.lab || item.Lab || item.LabName || item.Lab_Name || "",
                        Report: item.reportNo || item.Certificate_No || item.Report_No || item.Certi_No || item.CertificateNo || "",
                        Final_Price: Number(item.totalPrice || item.Final_Price || item.Price || item.Amount || item.Net_Amount) || 0,
                        Price_Per_Carat: Number(item.pricePerCt || item.Price_Per_Carat || item.Rate || item.PricePerCt) || 0,
                        Diamond_Image: item.imageLink || item.Diamond_Image || item.Image_Link || item.ImageURL || "",
                        Diamond_Video: item.videoLink || item.Diamond_Video || item.Video_Link || item.VideoURL || "",
                        Certificate_Image: item.certiFile || item.Certificate_Image || item.Certi_Link || item.CertificateURL || "",
                        Availability: item.status || item.Availability || "In Stock",
                        Measurements: item.measurements || item.Measurements || item.Measurement || "",
                        Depth: item.depth || item.Depth || item.DepthPer || item.Depth_Per || "",
                        table_name: item.table || item.Table || item.TablePer || item.Table_Name || item.table_name || "",
                        Girdle: item.Girdle || (item.girdleThin && item.girdleThick ? `${item.girdleThin}-${item.girdleThick}` : (item.girdleThin || item.girdleThick || "")),
                        Crown: item.crownHeight || item.Crown || item.Crown_Height || "",
                        Pavilion: item.pavilionDepth || item.Pavilion || item.Pavilion_Depth || "",
                        Culet: item.culetSize || item.Culet || item.Culet_Size || "",
                        Ratio: item.ratio || item.Ratio || "",
                        Fluorescence: item.fluorescenceIntensity || item.Fluorescence || item.FluorescenceName || "",
                        Bgm: item.milky || item.BGM || item.Bgm || "",
                        Growth_Type: item.growthType || item.Growth_Type || "",
                        Location: item.location || item.Location || "",
                        Source: apiConfig.url.trim(),
                        };
                    });
                    
                    allDiamonds = [...allDiamonds, ...mappedItems];
                }
            } catch (apiError) {
                console.error(`[API_SYNC] Error fetching from API ${apiConfig.url}:`, apiError.message);
                // Continue to next API even if one fails
            }
        }

        if (allDiamonds.length === 0 && activeApis.length > 0) {
            return res.status(200).json({ success: true, message: "No diamonds found from any active API", inserted: 0 });
        }

        // 1. DELETE ALL OLD DATA (Mandatory as requested)
        console.log("[API_SYNC] Removing all existing data from database...");
        await Diamond.deleteMany({});

        console.log(`[API_SYNC] Cleaned DB. Inserting ${allDiamonds.length} new records...`);

        // 3. Bulk Insert
        let result = [];
        if (allDiamonds.length > 0) {
            result = await Diamond.insertMany(allDiamonds, { ordered: false });
        }

        res.status(200).json({
            success: true,
            total: allDiamonds.length,
            inserted: result.length,
            message: `Successfully replaced everything with ${result.length} diamonds from ${activeApis.length} APIs.`
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
