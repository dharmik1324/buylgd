const axios = require("axios");
const Diamond = require("../models/Diamond");
const InventoryApi = require("../models/InventoryApi");

let isSyncInProgress = false;

const getSyncStatus = () => isSyncInProgress;

/**
 * Smart parser to handle both JSON and plain-text "key=value" or "key: value"
 */
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
                const stripQuotes = (s) => {
                    s = s.trim();
                    if ((s.startsWith("'") && s.endsWith("'")) || 
                        (s.startsWith('"') && s.endsWith('"')) ||
                        (s.startsWith('“') && s.endsWith('”'))) {
                        return s.substring(1, s.length - 1);
                    }
                    return s;
                };
                let key = stripQuotes(match[1]);
                let value = stripQuotes(match[2]);
                obj[key] = value;
            }
        }
        return obj;
    }
};

/**
 * Recursively find the largest array in an object
 */
const findLargestArray = (obj) => {
    if (Array.isArray(obj)) return obj;
    if (!obj || typeof obj !== 'object') return [];
    
    let largestArray = [];
    for (const key in obj) {
        if (Array.isArray(obj[key])) {
            if (obj[key].length > largestArray.length) {
                largestArray = obj[key];
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const subArray = findLargestArray(obj[key]);
            if (subArray.length > largestArray.length) {
                largestArray = subArray;
            }
        }
    }
    return largestArray;
};

/**
 * Main sync logic to fetch from all active APIs and refresh the Diamond collection
 */
const syncInventoryFromApis = async (options = {}) => {
    if (isSyncInProgress) {
        console.log("[SYNC_UTIL] Sync already in progress, skipping duplicate request.");
        return { success: false, message: "Sync already in progress" };
    }
    
    isSyncInProgress = true;
    try {
        const activeApis = await InventoryApi.find({ isActive: true });
        let allDiamonds = [];
        let insertedCount = 0;

        console.log(`[SYNC_UTIL] [${new Date().toLocaleTimeString()}] Found ${activeApis.length} active APIs for synchronization.`);

        for (const apiConfig of activeApis) {
            try {
                const apiName = apiConfig.name || apiConfig.url;
                console.log(`[SYNC_UTIL] Fetching from ${apiName} (${apiConfig.method})...`);
                let response;
                
                let requestBody = parseConfigString(apiConfig.body);
                let requestHeaders = parseConfigString(apiConfig.headers);

                if (apiConfig.method === "POST") {
                    try {
                        response = await axios.post(apiConfig.url, requestBody, { 
                            headers: requestHeaders,
                            timeout: 300000 // 5 minutes for large datasets
                        });
                    } catch (initialError) {
                        // Fallback: URL Encoded Form Data
                        if (initialError.response && [403, 400, 415].includes(initialError.response.status)) {
                            console.warn(`[SYNC_UTIL] JSON POST failed for ${apiConfig.url}. Retrying with urlencoded form data...`);
                            const qs = require('qs');
                            const fallbackHeaders = { ...requestHeaders, 'Content-Type': 'application/x-www-form-urlencoded' };
                            response = await axios.post(apiConfig.url, qs.stringify(requestBody), { headers: fallbackHeaders, timeout: 300000 });
                        } else {
                            throw initialError;
                        }
                    }
                } else {
                    response = await axios.get(apiConfig.url, { 
                        params: typeof requestBody === 'object' ? requestBody : {},
                        headers: requestHeaders,
                        timeout: 300000
                    });
                }

                const rawData = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : findLargestArray(response.data);

                console.log(`[SYNC_UTIL] ${apiConfig.url} returned ${rawData.length} raw items.`);

                if (rawData.length > 0) {
                    // Process in chunks of 500 to keep the event loop responsive
                    const chunkSize = 500;
                    for (let i = 0; i < rawData.length; i += chunkSize) {
                        const chunk = rawData.slice(i, i + chunkSize);
                        const mappedChunk = chunk.map((item, idx) => {
                            // Optimize: create lowercase key map once per item
                            const itemKeys = Object.keys(item);
                            const lowerMap = {};
                            for(const k of itemKeys) {
                                if (item[k] !== undefined) lowerMap[k.toLowerCase()] = item[k];
                            }

                            const getV = (preferredKeys, fallback = "") => {
                                for (const pk of preferredKeys) {
                                    if (item[pk] !== undefined && item[pk] !== null && String(item[pk]).trim() !== "") return item[pk];
                                    const lowerPk = pk.toLowerCase();
                                    if (lowerMap[lowerPk] !== undefined && lowerMap[lowerPk] !== null && String(lowerMap[lowerPk]).trim() !== "") return lowerMap[lowerPk];
                                }
                                return fallback;
                            };

                            const autoDiscoverMedia = (type) => {
                                // First pass: check all string values that start with http/https
                                const allValues = Object.entries(item);
                                
                                if (type === 'image') {
                                    // Priority 1: clear image extensions
                                    for (const [, val] of allValues) {
                                        if (typeof val !== 'string' || !val.trim()) continue;
                                        const v = val.toLowerCase();
                                        if (v.startsWith('http') && (v.endsWith('.jpg') || v.endsWith('.jpeg') || v.endsWith('.png') || v.endsWith('.webp') || v.includes('still.jpg'))) return val;
                                    }
                                    // Priority 2: URL contains image-related keywords
                                    for (const [, val] of allValues) {
                                        if (typeof val !== 'string' || !val.trim()) continue;
                                        const v = val.toLowerCase();
                                        if (v.startsWith('http') && (v.includes('image') || v.includes('photo') || v.includes('/img') || v.includes('stone_img') || v.includes('still') || v.includes('picture') || v.includes('view_image') || v.includes('imgg'))) return val;
                                    }
                                    return '';
                                }
                                
                                if (type === 'video') {
                                    for (const [, val] of allValues) {
                                        if (typeof val !== 'string' || !val.trim()) continue;
                                        const v = val.toLowerCase();
                                        if (v.startsWith('http') && (v.endsWith('.mp4') || v.endsWith('.webm') || v.includes('video') || v.includes('v360') || v.includes('360') || v.includes('movie'))) {
                                            if (!v.endsWith('.jpg') && !v.endsWith('.png')) return val;
                                        }
                                    }
                                    return '';
                                }
                                
                                if (type === 'cert') {
                                    for (const [, val] of allValues) {
                                        if (typeof val !== 'string' || !val.trim()) continue;
                                        const v = val.toLowerCase();
                                        if (v.startsWith('http') && (v.includes('cert') || v.includes('pdf') || v.includes('report') || v.includes('certi'))) return val;
                                    }
                                    return '';
                                }
                                
                                return '';
                            };

                            return {
                                ...item,
                                Stock_ID: getV(["Stone_NO", "Ref_No", "ref_No", "Stock_No", "stock_no", "StockNo", "SRNO", "stockNo", "Stock_ID", "id"]) || `AUTO-${apiConfig._id.toString().substring(0,4)}-${i + idx}`,
                                Shape: getV(["shape", "ShapeName", "Shape_Name", "SHAPE"]),
                                Weight: Number(getV(["weight", "Carat", "Cts", "Weight", "Size"])) || 0,
                                Color: getV(["color", "ColorName", "Color_Name", "COLOR"]),
                                Clarity: getV(["clarity", "ClarityName", "Clarity_Name", "CLARITY"]),
                                Cut: getV(["cut", "CutName", "Cut_Name", "CUT"]),
                                Polish: getV(["polish", "PolishName", "Polish_Name", "POLISH"]),
                                Symmetry: getV(["symmetry", "SymmetryName", "Symmetry_Name", "SYMMETRY"]),
                                Lab: getV(["lab", "LabName", "Lab_Name", "LAB"]),
                                Report: getV(["Lab_Report_No", "reportNo", "Certificate_No", "Report"]),
                                Final_Price: Number(getV(["SaleAmt", "totalPrice", "Final_Price", "Price", "Amount", "Net_Amount", "total_price", "TotalPrice", "sale_amount", "SaleAmount", "NetAmt", "NetAmount"])) || 0,
                                Price_Per_Carat: Number(getV(["SaleRate", "pricePerCt", "Price_Per_Carat", "Rate", "PricePerCt", "Rate_Per_Ct", "Net_Amount", "price_per_carat", "PricePerCarat", "rate_per_ct", "RatePerCt", "PerCtRate"])) || 0,
                                Diamond_Image: getV(["Stone_Img_url", "imageLink", "Diamond_Image", "Image_Link", "view_image", "ImageURL", "still_image", "Image_URL", "img_link", "ImageLink", "stone_img_url", "StoneImgUrl", "stone_image", "DiamondImage", "image_url", "imgg", "ImgURL", "img_url", "photo", "Photo"]) || autoDiscoverMedia('image'),
                                Diamond_Video: getV(["Video_url", "videoLink", "Diamond_Video", "Video_Link", "v360", "vdbVideo", "VideoURL", "Video_URL", "video_link", "VideoLink", "DiamondVideo", "video_url", "video360", "Video360", "V360"]) || autoDiscoverMedia('video'),
                                Certificate_Image: getV(["Certificate_file_url", "certiFile", "Certificate_Image", "Certi_Link", "CertificateURL", "CertiURL", "cert_url", "certi_url", "CertiFile", "certImage", "CertImage", "cert_link", "CertLink"]) || autoDiscoverMedia('cert'),
                                Availability: getV(["StockStatus", "status", "Availability", "Status"], "Available"),
                                Measurements: getV(["Measurement", "measurements", "Dimensions"]),
                                Depth: getV(["Total_Depth_Per", "depth", "DepthPer", "Depth_Per", "Depth"]),
                                table_name: getV(["Table_Diameter_Per", "table", "TablePer", "Table_Name", "Table", "Table_Per"]),
                                Girdle: getV(["GirdleName", "Girdle", "Girdle_Name"]) || (item.girdleThin && item.girdleThick ? `${item.girdleThin}-${item.girdleThick}` : (item.girdleThin || item.girdleThick || "")),
                                Crown: getV(["CrownHeight", "crownHeight", "Crown", "Crown_Height", "CrownAngle"]),
                                Pavilion: getV(["PavillionHeight", "pavilionDepth", "Pavilion", "Pavilion_Depth", "PavilionAngle"]),
                                Culet: getV(["CuletSize", "culetSize", "Culet", "Culet_Size", "culet"]),
                                Ratio: getV(["Ratio", "ratio", "Ratio"]),
                                Fluorescence: getV(["FlrIntens", "fluorescenceIntensity", "Fluorescence", "FluorescenceName", "Fluor", "Fluo"]),
                                Bgm: getV(["Milkey", "milky", "BGM", "Bgm", "EyeClean"]),
                                Growth_Type: getV(["CVD_HPHT", "growthType", "Growth_Type", "Growth"]),
                                Location: getV(["Location", "location", "City", "Country"]),
                                Source: apiConfig.url.trim(),
                            };
                        });
                        allDiamonds = [...allDiamonds, ...mappedChunk];
                        
                        // Yield to event loop
                        await new Promise(resolve => setImmediate(resolve));
                    }
                }
            } catch (apiError) {
                console.error(`[SYNC_UTIL] Error fetching from API ${apiConfig.url}:`, apiError.message);
            }
        }

        // Process and insert after ALL APIs are successful
        if (allDiamonds.length > 0) {
            // Deduplicate by Stock_ID
            const uniqueDiamondsMap = new Map();
            allDiamonds.forEach(d => {
                if (d.Stock_ID) uniqueDiamondsMap.set(d.Stock_ID, d);
            });
            const uniqueDiamonds = Array.from(uniqueDiamondsMap.values());
            
            console.log(`[SYNC_UTIL] Found ${allDiamonds.length} items, reduced to ${uniqueDiamonds.length} unique. Using Atomic Replacement...`);

            const mongoose = require("mongoose");
            const db = mongoose.connection.db;
            const tempCollName = "diamonds_temp_sync";
            
            // 1. Clear temp collection
            try {
                await db.collection(tempCollName).deleteMany({});
            } catch (e) {}

            // 2. Insert into temp collection
            try {
                console.log(`[SYNC_UTIL] Inserting into temp collection...`);
                // Process in smaller batches for the insert to avoid memory/buffer issues
                const batchSize = 1000;
                for (let i = 0; i < uniqueDiamonds.length; i += batchSize) {
                    const batch = uniqueDiamonds.slice(i, i + batchSize);
                    await db.collection(tempCollName).insertMany(batch, { ordered: false });
                    console.log(`[SYNC_UTIL] Atomic Sync progressing... ${i + batch.length}/${uniqueDiamonds.length}`);
                }
                
                // 3. RECREATE INDEXES on temp collection before rename
                console.log(`[SYNC_UTIL] Rebuilding indexes on temp collection...`);
                await db.collection(tempCollName).createIndex({ Stock_ID: 1 });
                await db.collection(tempCollName).createIndex({ Shape: 1 });
                await db.collection(tempCollName).createIndex({ Weight: 1 });
                await db.collection(tempCollName).createIndex({ Source: 1 });
                await db.collection(tempCollName).createIndex({ Final_Price: 1 });
                await db.collection(tempCollName).createIndex({ Availability: 1 });
                await db.collection(tempCollName).createIndex({ createdAt: -1 });

                // 4. ATOMIC RENAME (Instantly replaces the live collection with NO downtime)
                // Note: dropTarget: true means it will replace the existing 'diamonds' collection
                await db.collection(tempCollName).rename("diamonds", { dropTarget: true });
                
                insertedCount = uniqueDiamonds.length;
                console.log(`[SYNC_UTIL] Atomic replacement successful: ${insertedCount} items.`);
            } catch (bulkError) {
                console.error("[SYNC_UTIL] Atomic Replacement failed during insert/rename:", bulkError.message);
                throw bulkError;
            }
        } else if (activeApis.length > 0) {
             console.warn("[SYNC_UTIL] No diamonds found from any active API. Skipping replace to preserve data.");
             return { success: false, count: 0, message: "No diamonds found from APIs. preservng DB." };
        }

        console.log(`[SYNC_UTIL] ✅ Sync completed. Inserted: ${insertedCount}. APIs: ${activeApis.length}`);

        console.log(`[SYNC_UTIL] ✅ Sync completed. Inserted: ${insertedCount}. APIs: ${activeApis.length}`);
        
        // Final Debug Save to file
        const fs = require('fs');
        const syncLog = `[${new Date().toISOString()}] Result: ${insertedCount} items from ${activeApis.length} APIs. Summary: ${allDiamonds.length} raw found.\n`;
        fs.appendFileSync('sync_debug.log', syncLog);

        return { success: true, count: insertedCount, apiCount: activeApis.length };

    } catch (error) {
        const fs = require('fs');
        fs.appendFileSync('sync_debug.log', `[${new Date().toISOString()}] CRITICAL ERROR: ${error.message}\n`);
        console.error("[SYNC_UTIL] Critical Error:", error);
        throw error;
    } finally {
        isSyncInProgress = false;
    }
};

module.exports = { syncInventoryFromApis, getSyncStatus, parseConfigString };

