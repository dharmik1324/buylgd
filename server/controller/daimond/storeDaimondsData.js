const axios = require("axios");
const Diamond = require("../../models/Diamond");

const InventoryApi = require("../../models/InventoryApi");

const storeDaimond = async (req, res) => {
    try {
        const activeApis = await InventoryApi.find({ isActive: true });
        
        let allDiamonds = [];

        // 1. Mandatory Clear (Clear before fetching to ensure fresh state, or clear after successful fetch)
        // Optimization: Fetch first, then clear and insert if success.
        
        for (const apiConfig of activeApis) {
            try {
                console.log(`[API_SYNC] Fetching from ${apiConfig.url} (${apiConfig.method})...`);
                let response;
                
                // Prepare request data from body string (assumed to be JSON)
                let requestBody = {};
                if (apiConfig.body) {
                    try {
                        requestBody = JSON.parse(apiConfig.body);
                    } catch (e) {
                        console.warn(`[API_SYNC] Warning: Failed to parse body for ${apiConfig.url}. Using as-is string.`);
                        requestBody = apiConfig.body; 
                    }
                }

                // Prepare headers
                let requestHeaders = {};
                if (apiConfig.headers) {
                    try {
                        requestHeaders = JSON.parse(apiConfig.headers);
                    } catch (e) {
                        console.warn(`[API_SYNC] Warning: Failed to parse headers for ${apiConfig.name}.`);
                    }
                }

                if (apiConfig.method === "POST") {
                    response = await axios.post(apiConfig.url, requestBody, { headers: requestHeaders });
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
                console.error(`Error fetching from API ${apiConfig.url}:`, apiError.message);
                // Continue to next API even if one fails
            }
        }


        if (allDiamonds.length === 0 && activeApis.length > 0) {
             // If we have active APIs but no data was fetched, maybe don't clear? 
             // Or at least return nicely.
            return res.status(200).json({ success: true, message: "No diamonds found from any active API", inserted: 0 });
        }

        // If no active APIs found, it will just clear the database which might be intended if sync is called.
        await Diamond.deleteMany({});

        let result = [];
        if (allDiamonds.length > 0) {
            result = await Diamond.insertMany(allDiamonds, { ordered: false });
        }

        res.status(200).json({
            success: true,
            total: allDiamonds.length,
            inserted: result.length,
            message: `Database cleared and re-synced with ${activeApis.length} APIs.`
        });
    } catch (error) {
        console.error("Error storing diamonds:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = { storeDaimond };
