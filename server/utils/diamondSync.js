const axios = require("axios");
const Diamond = require("../models/Diamond");
const InventoryApi = require("../models/InventoryApi");

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
    try {
        const activeApis = await InventoryApi.find({ isActive: true });
        let allDiamonds = [];

        console.log(`[SYNC_UTIL] Found ${activeApis.length} active APIs for synchronization.`);

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
                    const mappedItems = rawData.map((item, idx) => {
                        // Optimize: create lowercase key map once per item
                        const itemKeys = Object.keys(item);
                        const lowerMap = {};
                        for(const k of itemKeys) lowerMap[k.toLowerCase()] = item[k];

                        const getV = (preferredKeys, fallback = "") => {
                            for (const pk of preferredKeys) {
                                // Priority 1: Exact case match
                                if (item[pk] !== undefined && item[pk] !== null) return item[pk];
                                // Priority 2: Case-insensitive match from the map
                                const lowerPk = pk.toLowerCase();
                                if (lowerMap[lowerPk] !== undefined && lowerMap[lowerPk] !== null) return lowerMap[lowerPk];
                            }
                            return fallback;
                        };

                        const stockId = getV(["stockNo", "Stock_ID", "id", "Ref_No", "ref_No", "Stock_No", "stock_no", "StockNo", "SRNO"]);
                        
                        return {
                            ...item, // Raw data as base
                            Stock_ID: stockId || `AUTO-${apiConfig._id.toString().substring(0,4)}-${idx}`,
                            Stock: stockId || `AUTO-${idx}`,
                            Shape: getV(["shape", "ShapeName", "Shape_Name"]),
                            Weight: Number(getV(["weight", "Carat", "Cts", "cts"])) || 0,
                            Color: getV(["color", "ColorName", "Color_Name"]),
                            Clarity: getV(["clarity", "ClarityName", "Clarity_Name"]),
                            Cut: getV(["cut", "CutName", "Cut_Name"]),
                            Polish: getV(["polish", "PolishName", "Polish_Name"]),
                            Symmetry: getV(["symmetry", "SymmetryName", "Symmetry_Name"]),
                            Lab: getV(["lab", "LabName", "Lab_Name"]),
                            Report: getV(["reportNo", "Certificate_No", "Report_No", "Certi_No", "CertificateNo"]),
                            Final_Price: Number(getV(["totalPrice", "Final_Price", "Price", "Amount", "Net_Amount"])) || 0,
                            Price_Per_Carat: Number(getV(["pricePerCt", "Price_Per_Carat", "Rate", "PricePerCt"])) || 0,
                            Diamond_Image: getV(["imageLink", "Diamond_Image", "Image_Link", "ImageURL", "still_image"]),
                            Diamond_Video: getV(["videoLink", "Diamond_Video", "Video_Link", "VideoURL"]),
                            Certificate_Image: getV(["certiFile", "Certificate_Image", "Certi_Link", "CertificateURL"]),
                            Availability: getV(["status", "Availability"], "In Stock"),
                            Measurements: getV(["measurements", "Measurement"]),
                            Depth: getV(["depth", "DepthPer", "Depth_Per"]),
                            table_name: getV(["table", "TablePer", "Table_Name"]),
                            Girdle: getV(["Girdle"]) || (item.girdleThin && item.girdleThick ? `${item.girdleThin}-${item.girdleThick}` : (item.girdleThin || item.girdleThick || "")),
                            Crown: getV(["crownHeight", "Crown", "Crown_Height"]),
                            Pavilion: getV(["pavilionDepth", "Pavilion", "Pavilion_Depth"]),
                            Culet: getV(["culetSize", "Culet", "Culet_Size"]),
                            Ratio: getV(["ratio", "Ratio"]),
                            Fluorescence: getV(["fluorescenceIntensity", "Fluorescence", "FluorescenceName"]),
                            Bgm: getV(["milky", "BGM", "Bgm"]),
                            Growth_Type: getV(["growthType", "Growth_Type"]),
                            Location: getV(["location", "Location"]),
                            Source: apiConfig.url.trim(),
                        };
                    });
                    
                    allDiamonds = [...allDiamonds, ...mappedItems];
                }
            } catch (apiError) {
                console.error(`[SYNC_UTIL] Error fetching from API ${apiConfig.url}:`, apiError.message);
            }
        }

        // Logic check: only replace if we found something OR if we just removed all APIs
        if (allDiamonds.length === 0 && activeApis.length > 0) {
            return { success: true, count: 0, message: "No diamonds found from any active API. Database was preserved." };
        }

        // 1. DELETE ALL OLD DATA FROM APIs (keep CSV data)
        console.log("[SYNC_UTIL] Replacing all API-sourced data...");
        await Diamond.deleteMany({ Source: { $ne: "CSV" } });

        let insertedCount = 0;
        if (allDiamonds.length > 0) {
            // Deduplicate by Stock_ID to prevent E11000 duplicate key errors
            // If multiple APIs return the same Stock_ID, we keep the last one found.
            const uniqueDiamondsMap = new Map();
            allDiamonds.forEach(d => {
                if (d.Stock_ID) {
                    uniqueDiamondsMap.set(d.Stock_ID, d);
                }
            });
            const uniqueDiamonds = Array.from(uniqueDiamondsMap.values());
            
            console.log(`[SYNC_UTIL] Found ${allDiamonds.length} items, reduced to ${uniqueDiamonds.length} unique diamonds.`);

            // Use bulk insert for efficiency
            try {
                const result = await Diamond.insertMany(uniqueDiamonds, { ordered: false });
                insertedCount = result.length;
            } catch (bulkError) {
                // If it still fails (e.g. some other unique constraint), we check how many actually got in
                insertedCount = bulkError.insertedDocs ? bulkError.insertedDocs.length : 0;
                console.warn(`[SYNC_UTIL] Some items failed to insert: ${bulkError.message}. Inserted ${insertedCount} items.`);
            }
        }

        console.log(`[SYNC_UTIL] ✅ Sync completed. Inserted: ${insertedCount}. APIs: ${activeApis.length}`);
        return { success: true, count: insertedCount, apiCount: activeApis.length };

    } catch (error) {
        console.error("[SYNC_UTIL] Critical Error:", error);
        throw error;
    }
};

module.exports = { syncInventoryFromApis };
