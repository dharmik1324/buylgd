const Diamond = require("../../models/Diamond");
const CsvDiamond = require("../../models/CsvDiamond");
const User = require("../../models/User");
const InventoryApi = require("../../models/InventoryApi");


const getDiamondsData = async (req, res) => {
    try {
        console.log('GET /api/admin/diamonds | Query:', req.query);

        // Fetch markup for current user if not admin
        let markup = 0;
        if (req.user && req.user.role !== 'admin') {
            const user = await User.findById(req.user.id);
            if (user) {
                markup = user.priceMarkup || 0;
            }
        }
        const markupFactor = 1 + (markup / 100);

        // Fetch ALL currently active API URLs for strict source filtering
        const activeApis = await InventoryApi.find({ isActive: true }).select('url');
        const activeApiUrls = activeApis.map(api => api.url);
        console.log('DEBUG: Found', activeApis.length, 'active APIs. URLs:', activeApiUrls);

        let {
            page = 1,
            limit = 12,
            search = "",
            shapes = "",
            colors = "",
            clarities = "",
            cuts = "",
            priceMin,
            priceMax,
            caratMin,
            caratMax,
            sort = "newest",
            source = "",
            includeStats = "false",
            // Also support singular names from frontend
            shape,
            color,
            clarity,
            cut
        } = req.query;

        // Map singular frontend filters to plural backend filters
        if (!shapes && shape) shapes = shape;
        if (!colors && color) colors = color;
        if (!clarities && clarity) clarities = clarity;
        if (!cuts && cut) cuts = cut;
        
        const srcUpper = (source || "").toUpperCase();

        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 12);
        const skip = (page - 1) * limit;

        // Pre-normalization stage for both collections
        const normalizeMain = {
            $addFields: {
                source: "API",
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { 
                                $cond: [
                                    { $or: [{ $eq: ["$Final_Price", 0] }, { $eq: ["$Final_Price", null] }] },
                                    { $ifNull: ["$SaleAmt", "$Price", 0] },
                                    "$Final_Price"
                                ]
                            } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Price_Per_Carat: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { 
                                $cond: [
                                    { $or: [{ $eq: ["$Price_Per_Carat", 0] }, { $eq: ["$Price_Per_Carat", null] }] },
                                    { $ifNull: ["$SaleRate", "$Rate", 0] },
                                    "$Price_Per_Carat"
                                ]
                            } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stone_NO", "$Stock_No", "$Stock_ID", "$Stock"] },
                Certificate_No: { $ifNull: ["$Lab_Report_No", "$Certificate_No", "$Lab Report No"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] },
                Diamond_Video: { 
                    $cond: [
                        { $or: [{ $eq: ["$Diamond_Video", ""] }, { $eq: ["$Diamond_Video", null] }] },
                        { $ifNull: ["$Video_url", "$videoLink", "$Video", ""] },
                        "$Diamond_Video"
                    ]
                },
                Certificate_Image: { 
                    $cond: [
                        { $or: [{ $eq: ["$Certificate_Image", ""] }, { $eq: ["$Certificate_Image", null] }] },
                        { $ifNull: ["$Certificate_file_url", "$certiFile", "$certi_file", "$Lab Report No", ""] },
                        "$Certificate_Image"
                    ]
                },
                Diamond_Image: { 
                    $cond: [
                        { $or: [{ $eq: ["$Diamond_Image", ""] }, { $eq: ["$Diamond_Image", null] }] },
                        { $ifNull: ["$Stone_Img_url", "$imageLink", "$Image", "$View Image", ""] },
                        "$Diamond_Image"
                    ]
                }
            }
        };

        const normalizeCsv = {
            $addFields: {
                source: "CSV",
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { $ifNull: ["$Price", "$Final_Price", "$SaleAmt", 0] } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Price_Per_Carat: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { $ifNull: ["$Price_Per_Carat", "$Rate", 0] } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stock_ID", "$Stock_No", "$Stock"] },
                Certificate_No: { $ifNull: ["$Certificate_No", "$Lab Report No"] },
                Report: { $ifNull: ["$Report", "$Lab Report No"] },
                Lab: { $ifNull: ["$Lab", "GIA"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] },
                Diamond_Video: { $ifNull: ["$Diamond_Video", "$Video", "$Video Link"] },
                Certificate_Image: { $ifNull: ["$Certificate_Image", "$Certificate", "$View Certi", "$Lab Report No"] },
                Diamond_Image: { $ifNull: ["$Diamond_Image", "$View Image", "$Image"] }
            }
        };

        // Build filtering logic based on normalized fields
        const commonFilter = {};
        if (search) {
            commonFilter.$or = [
                { Stock_No: { $regex: search, $options: "i" } },
                { Certificate_No: { $regex: search, $options: "i" } },
                { Shape: { $regex: search, $options: "i" } },
                { Color: { $regex: search, $options: "i" } }
            ];
        }

        if (shapes) commonFilter.Shape = { $in: shapes.split(",").map(s => s.trim().toUpperCase()) };
        if (colors) commonFilter.Color = { $in: colors.split(",").map(c => c.trim().toUpperCase()) };
        if (clarities) commonFilter.Clarity = { $in: clarities.split(",").map(c => c.trim().toUpperCase()) };
        if (cuts) commonFilter.Cut = { $in: cuts.split(",").map(c => c.trim().toUpperCase()) };

        if (caratMin || caratMax) {
            commonFilter.Weight = {};
            if (caratMin) commonFilter.Weight.$gte = Number(caratMin);
            if (caratMax) commonFilter.Weight.$lte = Number(caratMax);
        }

        const priceFilter = {};
        if (priceMin) priceFilter.$gte = Number(priceMin);
        if (priceMax) priceFilter.$lte = Number(priceMax);

        const finalMatch = {
            ...commonFilter,
            ...(Object.keys(priceFilter).length ? { Final_Price: priceFilter } : {})
        };

        if (srcUpper) {
            finalMatch.source = srcUpper;
        }

        // --- SOURCE FILTERING LOGIC ---
        // Relaxed: Show all data unless specifically filtered by source
        let sourceMatch = {};
        if (srcUpper === "API" && activeApiUrls.length > 0) {
            sourceMatch = { Source: { $in: activeApiUrls } };
        } else if (srcUpper && srcUpper !== "CSV" && srcUpper !== "API") {
            // Specific source URL provided (or name)
            sourceMatch = { Source: source };
        }

        // 1. Get Totals
        const countPipeline = [];
        if (srcUpper === "CSV") {
            countPipeline.push(normalizeCsv, { $match: { ...finalMatch } });
        } else {
            // If API source or ALL sources
            countPipeline.push(
                normalizeMain,
                { $match: { ...finalMatch, ...sourceMatch } }
            );
            
            // If ALL sources, union with CSV
            if (!srcUpper) {
                countPipeline.push({
                    $unionWith: {
                        coll: "csvdiamonds",
                        pipeline: [
                            normalizeCsv,
                            { $match: finalMatch }
                        ]
                    }
                });
            }
        }
        countPipeline.push({ $count: "total" });

        const countResult = (srcUpper === "CSV") 
            ? await CsvDiamond.aggregate(countPipeline)
            : await Diamond.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // 2. Get Paginated Data
        const sortStage = {};
        if (sort === "priceAsc") sortStage.Final_Price = 1;
        else if (sort === "priceDesc") sortStage.Final_Price = -1;
        else if (sort === "caratAsc") sortStage.Weight = 1;
        else if (sort === "caratDesc") sortStage.Weight = -1;
        else sortStage.createdAt = -1;

        const dataPipeline = [];
        if (srcUpper === "CSV") {
            dataPipeline.push(
                normalizeCsv,
                { $match: finalMatch }
            );
        } else {
            dataPipeline.push(
                normalizeMain,
                { $match: { ...finalMatch, ...sourceMatch } }
            );
            
            if (!srcUpper) {
                dataPipeline.push({
                    $unionWith: {
                        coll: "csvdiamonds",
                        pipeline: [
                            normalizeCsv,
                            { $match: finalMatch }
                        ]
                    }
                });
            }
        }

        dataPipeline.push(
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit }
        );

        const data = (source.toUpperCase() === "CSV")
            ? await CsvDiamond.aggregate(dataPipeline)
            : await Diamond.aggregate(dataPipeline);

        // 3. Metadata
        let metadata = null;
        if (page === 1) {
            try {
                // Get unified distinct values using aggregation and $unionWith
                // Metadata pipelines based on relaxed source filtering
                const metaPipeline = (field) => [
                    { $match: sourceMatch },
                    { $project: { [field]: { $ifNull: [`$${field}`, `$${field.toUpperCase()}`] } } },
                    {
                        $unionWith: {
                            coll: "csvdiamonds",
                            pipeline: [{ $project: { [field]: { $ifNull: [`$${field}`, `$${field.toUpperCase()}`] } } }]
                        }
                    },
                    { $group: { _id: null, values: { $addToSet: { $toUpper: { $trim: { input: { $ifNull: [`$${field}`, ""] } } } } } } }
                ];

                const [resShapes, resColors, resClarities, resRanges] = await Promise.all([
                    Diamond.aggregate(metaPipeline("Shape")),
                    Diamond.aggregate(metaPipeline("Color")),
                    Diamond.aggregate(metaPipeline("Clarity")),
                    Diamond.aggregate([
                        { $match: sourceMatch },
                        normalizeMain,
                        {
                            $unionWith: {
                                coll: "csvdiamonds",
                                pipeline: [normalizeCsv]
                            }
                        },

                        {
                            $group: {
                                _id: null,
                                minPrice: { $min: "$Final_Price" },
                                maxPrice: { $max: "$Final_Price" },
                                minCarat: { $min: "$Weight" },
                                maxCarat: { $max: "$Weight" }
                            }
                        }
                    ])
                ]);

                const preferredShapeOrder = ["ROUND", "PRINCESS", "OVAL", "MARQUISE", "EMERALD", "PEAR", "RADIANT", "CUSHION", "HEART", "ASSCHER"];
                const sortWithPreferred = (arr, preferred) => {
                    return arr.sort((a, b) => {
                        const indexA = preferred.indexOf(a.toUpperCase());
                        const indexB = preferred.indexOf(b.toUpperCase());
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return a.localeCompare(b);
                    });
                };

                const rangeValues = resRanges[0] || { minPrice: 0, maxPrice: 100000, minCarat: 0, maxCarat: 20 };

                let statsData = { totalValue: 0, shapeStats: [] };
                if (includeStats === "true") {
                    // Calculate stats from both collections separately and merge to handle empty collections correctly
                    const [mainStats, csvStats] = await Promise.all([
                        Diamond.aggregate([
                            { $match: sourceMatch },
                            normalizeMain,
                            {
                                $group: {

                                    _id: "$Shape",
                                    count: { $sum: 1 },
                                    totalValue: { $sum: "$Final_Price" }
                                }
                            }
                        ]),
                        CsvDiamond.aggregate([
                            normalizeCsv,
                            {
                                $group: {
                                    _id: "$Shape",
                                    count: { $sum: 1 },
                                    totalValue: { $sum: "$Final_Price" }
                                }
                            }
                        ])
                    ]);

                    const mergedMap = new Map();
                    let grandTotal = 0;

                    [...mainStats, ...csvStats].forEach(stat => {
                        const shape = stat._id || "UNKNOWN";
                        const current = mergedMap.get(shape) || { count: 0, totalValue: 0 };
                        mergedMap.set(shape, {
                            count: current.count + stat.count,
                            totalValue: current.totalValue + stat.totalValue
                        });
                        grandTotal += stat.totalValue;
                    });

                    statsData = {
                        totalValue: Math.round(grandTotal),
                        shapeStats: Array.from(mergedMap.entries()).map(([shape, data]) => ({
                            _id: shape,
                            count: data.count,
                            avgPrice: data.count > 0 ? data.totalValue / data.count : 0
                        }))
                    };
                }

                metadata = {
                    shapes: sortWithPreferred(Array.from(new Set([...preferredShapeOrder, ...(resShapes[0]?.values || [])])).filter(v => v && v !== ""), preferredShapeOrder),
                    colors: (resColors[0]?.values || []).filter(v => v && v !== "").sort(),
                    clarities: (resClarities[0]?.values || []).filter(v => v && v !== "").sort(),
                    priceMin: Math.floor(rangeValues.minPrice || 0),
                    priceMax: Math.ceil(rangeValues.maxPrice || 100000),
                    caratMin: Number((rangeValues.minCarat || 0).toFixed(2)),
                    caratMax: Number((rangeValues.maxCarat || 10).toFixed(2)),
                    ...statsData
                };
            } catch (metaErr) {
                console.warn("Metadata error:", metaErr);
                metadata = { shapes: [], colors: [], clarities: [] };
            }
        }

        res.status(200).json({
            success: true,
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDiamonds: total,
                limit
            },
            metadata
        });

    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        res.status(500).json({
            success: false,
            message: "Inventory failed to load. Please try refreshing or checking your connection.",
            error: error.message
        });
    }
};

const getDiamondsCount = async (req, res) => {
    try {
        // Fetch markup for current user if not admin
        let markup = 0;
        if (req.user && req.user.role !== 'admin') {
            const user = await User.findById(req.user.id);
            if (user) {
                markup = user.priceMarkup || 0;
            }
        }
        const markupFactor = 1 + (markup / 100);

        let {
            search = "",
            shapes = "",
            colors = "",
            clarities = "",
            cuts = "",
            priceMin,
            priceMax,
            caratMin,
            caratMax
        } = req.query;

        const normalizeMain = {
            $addFields: {
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { $ifNull: ["$Final_Price", "$SaleAmt", "$Price", 0] } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Price_Per_Carat: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { $ifNull: ["$Price_Per_Carat", "$Rate", 0] } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stock_No", "$Stock_ID", "$Stock"] },
                Certificate_No: { $ifNull: ["$Certificate_No", "$Lab Report No"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] }
            }
        };

        const normalizeCsv = {
            $addFields: {
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { 
                    $round: [
                        { $multiply: [
                            { $toDouble: { $ifNull: ["$Price", "$Final_Price", "$SaleAmt", 0] } },
                            markupFactor
                        ] },
                        2
                    ]
                },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stock_ID", "$Stock_No", "$Stock"] },
                Certificate_No: { $ifNull: ["$Certificate_No", "$Lab Report No"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] }
            }
        };

        const commonFilter = {};
        if (search) {
            commonFilter.$or = [
                { Stock_No: { $regex: search, $options: "i" } },
                { Certificate_No: { $regex: search, $options: "i" } },
                { Shape: { $regex: search, $options: "i" } },
                { Color: { $regex: search, $options: "i" } }
            ];
        }

        if (shapes) commonFilter.Shape = { $in: shapes.split(",").map(s => s.trim().toUpperCase()) };
        if (colors) commonFilter.Color = { $in: colors.split(",").map(c => c.trim().toUpperCase()) };
        if (clarities) commonFilter.Clarity = { $in: clarities.split(",").map(c => c.trim().toUpperCase()) };
        if (cuts) commonFilter.Cut = { $in: cuts.split(",").map(c => c.trim().toUpperCase()) };

        if (caratMin || caratMax) {
            commonFilter.Weight = {};
            if (caratMin) commonFilter.Weight.$gte = Number(caratMin);
            if (caratMax) commonFilter.Weight.$lte = Number(caratMax);
        }

        const priceFilter = {};
        if (priceMin) priceFilter.$gte = Number(priceMin);
        if (priceMax) priceFilter.$lte = Number(priceMax);

        const finalMatch = {
            ...commonFilter,
            ...(Object.keys(priceFilter).length ? { Final_Price: priceFilter } : {})
        };

        const pipeline = [
            normalizeMain,
            { $match: finalMatch },
            {
                $unionWith: {
                    coll: "csvdiamonds",
                    pipeline: [
                        normalizeCsv,
                        { $match: finalMatch }
                    ]
                }
            },
            { $count: "total" }
        ];

        const result = await Diamond.aggregate(pipeline);
        const total = result[0]?.total || 0;

        res.status(200).json({
            success: true,
            count: total
        });

    } catch (error) {
        console.error("Error counting diamonds:", error);
        res.status(500).json({
            success: false,
            message: "Failed to count diamonds",
            error: error.message
        });
    }
};

const updateDaimondsData = async (req, res) => {
    try {
        const diamond = await Diamond.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!diamond) {
            return res.status(404).json({ error: "Diamond not found" });
        }

        res.status(200).json(diamond);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDaimond = async (req, res) => {
    try {
        const diamond = await Diamond.findByIdAndDelete(req.params.id);

        if (!diamond) {
            return res.status(404).json({ error: "Diamond not found" });
        }

        res.status(200).json(diamond);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addDiamond = async (req, res) => {
    try {
        const newDiamond = new Diamond(req.body);
        const savedDiamond = await newDiamond.save();
        res.status(201).json(savedDiamond);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const bulkUpdateDiamonds = async (req, res) => {
    try {
        const { filter, update } = req.body;
        // filter matches the criteria (e.g. { Shape: "Round" })
        // update contains the changes (e.g. { field: "Final_Price", type: "percentage", value: 10 })

        const mongoFilter = {};
        if (filter.ids && Array.isArray(filter.ids) && filter.ids.length > 0) {
            mongoFilter._id = { $in: filter.ids };
        } else {
            if (filter.shape) mongoFilter.Shape = new RegExp(`^${filter.shape}$`, "i");
            if (filter.color) mongoFilter.Color = new RegExp(`^${filter.color}$`, "i");
            if (filter.clarity) mongoFilter.Clarity = new RegExp(`^${filter.clarity}$`, "i");
            if (filter.cut) mongoFilter.Cut = new RegExp(`^${filter.cut}$`, "i");
            if (filter.availability) mongoFilter.Availability = new RegExp(`^${filter.availability}$`, "i");
            if (filter.search) {
                mongoFilter.$or = [
                    { Shape: { $regex: filter.search, $options: "i" } },
                    { Lab: { $regex: filter.search, $options: "i" } },
                    { Stock_ID: { $regex: filter.search, $options: "i" } },
                    { Stock_No: { $regex: filter.search, $options: "i" } }
                ];
            }
        }

        let mongoUpdate = {};
        if (update.type === "percentage") {
            const multiplier = 1 + (Number(update.value) / 100);
            if (update.field === "Final_Price" || update.field === "Price_Per_Carat") {
                // Update both for consistency
                mongoUpdate = { $mul: { Final_Price: multiplier, Price_Per_Carat: multiplier } };
            } else {
                mongoUpdate = { $mul: { [update.field]: multiplier } };
            }
        } else if (update.type === "fixed") {
            const amount = Number(update.value);
            if (update.field === "Final_Price" || update.field === "Price_Per_Carat") {
                mongoUpdate = { $inc: { [update.field]: amount } };
            } else {
                mongoUpdate = { $inc: { [update.field]: amount } };
            }
        } else {
            mongoUpdate = { $set: { [update.field]: update.value } };
        }

        const result = await Diamond.updateMany(mongoFilter, mongoUpdate);
        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} diamonds`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const holdDiamond = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, days, hours } = req.body;

        const diamond = await Diamond.findById(id);

        if (!diamond) {
            return res.status(404).json({ success: false, message: "Diamond not found" });
        }

        // Check if already on hold and not expired
        if (diamond.onHold && diamond.holdExpiresAt > new Date()) {
            return res.status(400).json({
                success: false,
                message: "This diamond is already on hold by another user"
            });
        }

        const holdExpiresAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000));

        diamond.onHold = true;
        diamond.holdBy = userId;
        diamond.holdExpiresAt = holdExpiresAt;
        diamond.Availability = "On Hold";

        await diamond.save();

        // Emit socket event to admins for real-time update
        if (global.io) {
            global.io.to("admins").emit("hold-updated", diamond);
        }

        res.status(200).json({
            success: true,
            message: "Diamond successfully placed on hold",
            data: diamond
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const releaseHold = async (req, res) => {
    try {
        const { id } = req.params;
        const diamond = await Diamond.findById(id);

        if (!diamond) {
            return res.status(404).json({ success: false, message: "Diamond not found" });
        }

        diamond.onHold = false;
        diamond.holdBy = null;
        diamond.holdExpiresAt = null;
        diamond.Availability = "In Stock";

        await diamond.save();

        // Emit socket event to admins for real-time update
        if (global.io) {
            global.io.to("admins").emit("hold-released", id);
        }

        res.status(200).json({
            success: true,
            message: "Hold released successfully",
            data: diamond
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getHeldDiamonds = async (req, res) => {
    try {
        const diamonds = await Diamond.find({ onHold: true })
            .populate("holdBy", "name email contact companyName")
            .sort({ holdExpiresAt: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: diamonds
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPublicInventory = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 12,
            search = "",
            shapes = "",
            colors = "",
            clarities = "",
            cuts = "",
            priceMin,
            priceMax,
            caratMin,
            caratMax,
            sort = "newest",
            source = ""
        } = req.query;

        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 12);
        const skip = (page - 1) * limit;

        const normalizeMain = {
            $addFields: {
                source: "API",
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { 
                    $toDouble: { 
                        $cond: [
                             { $or: [{ $eq: ["$Final_Price", 0] }, { $eq: ["$Final_Price", null] }] },
                             { $ifNull: ["$SaleAmt", "$Price", 0] },
                             "$Final_Price"
                        ]
                    } 
                },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stock_No", "$Stone_NO", "$Stock_ID", "$Stock"] },
                Certificate_No: { $ifNull: ["$Certificate_No", "$Lab_Report_No", "$Lab Report No"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] },
                Availability: { $ifNull: ["$Availability", "$StockStatus", "$status", "Available"] },
                Diamond_Image: { 
                    $cond: [
                        { $or: [{ $eq: ["$Diamond_Image", ""] }, { $eq: ["$Diamond_Image", null] }] },
                        { $ifNull: ["$Stone_Img_url", "$imageLink", "$Image", ""] },
                        "$Diamond_Image"
                    ]
                },
                Diamond_Video: { 
                    $cond: [
                        { $or: [{ $eq: ["$Diamond_Video", ""] }, { $eq: ["$Diamond_Video", null] }] },
                        { $ifNull: ["$Video_url", "$videoLink", "$Video", ""] },
                        "$Diamond_Video"
                    ]
                },
                Certificate_Image: { 
                    $cond: [
                        { $or: [{ $eq: ["$Certificate_Image", ""] }, { $eq: ["$Certificate_Image", null] }] },
                        { $ifNull: ["$Certificate_file_url", "$certiFile", "$Report", ""] },
                        "$Certificate_Image"
                    ]
                }
            }
        };

        const normalizeCsv = {
            $addFields: {
                source: "CSV",
                Shape: { $toUpper: { $trim: { input: { $ifNull: ["$Shape", "$SHAPE", ""] } } } },
                Final_Price: { $toDouble: { $ifNull: ["$Price", "$Final_Price", "$SaleAmt", 0] } },
                Weight: { $toDouble: { $ifNull: ["$Weight", 0] } },
                Stock_No: { $ifNull: ["$Stock_ID", "$Stock_No", "$Stock"] },
                Certificate_No: { $ifNull: ["$Certificate_No", "$Lab Report No"] },
                Color: { $ifNull: ["$Color", "$color"] },
                Clarity: { $ifNull: ["$Clarity", "$clarity"] },
                Diamond_Image: { $ifNull: ["$Diamond_Image", "$View Image", "$Image"] },
                Availability: "Available"
            }
        };

        // Reuse filtering logic
        const commonFilter = {
            Availability: { $in: ["In Stock", "Available", "IN STOCK", "AVAILABLE"] }
        };

        if (search) {
            commonFilter.$or = [
                { Stock_No: { $regex: search, $options: "i" } },
                { Certificate_No: { $regex: search, $options: "i" } },
                { Shape: { $regex: search, $options: "i" } },
                { Color: { $regex: search, $options: "i" } }
            ];
        }

        if (shapes) commonFilter.Shape = { $in: shapes.split(",").map(s => s.trim().toUpperCase()) };
        if (colors) commonFilter.Color = { $in: colors.split(",").map(c => c.trim().toUpperCase()) };
        if (clarities) commonFilter.Clarity = { $in: clarities.split(",").map(c => c.trim().toUpperCase()) };
        if (cuts) commonFilter.Cut = { $in: cuts.split(",").map(c => c.trim().toUpperCase()) };

        if (caratMin || caratMax) {
            commonFilter.Weight = {};
            if (caratMin) commonFilter.Weight.$gte = Number(caratMin);
            if (caratMax) commonFilter.Weight.$lte = Number(caratMax);
        }

        const priceFilter = {};
        if (priceMin) priceFilter.$gte = Number(priceMin);
        if (priceMax) priceFilter.$lte = Number(priceMax);

        const finalMatch = {
            ...commonFilter,
            ...(Object.keys(priceFilter).length ? { Final_Price: priceFilter } : {})
        };

        if (source) {
            finalMatch.source = source.toUpperCase();
        }

        // 1. Get Totals
        const countPipeline = [];
        if (source.toUpperCase() === "CSV") {
            countPipeline.push(normalizeCsv, { $match: finalMatch });
        } else if (source.toUpperCase() === "API") {
            countPipeline.push(normalizeMain, { $match: finalMatch });
        } else {
            countPipeline.push(
                normalizeMain,
                { $match: finalMatch },
                {
                    $unionWith: {
                        coll: "csvdiamonds",
                        pipeline: [
                            normalizeCsv,
                            { $match: finalMatch }
                        ]
                    }
                }
            );
        }
        countPipeline.push({ $count: "total" });

        const countResult = (source.toUpperCase() === "CSV") 
            ? await CsvDiamond.aggregate(countPipeline)
            : await Diamond.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // 2. Get Data
        const sortStage = {};
        if (sort === "priceAsc") sortStage.Final_Price = 1;
        else if (sort === "priceDesc") sortStage.Final_Price = -1;
        else if (sort === "caratAsc") sortStage.Weight = 1;
        else if (sort === "caratDesc") sortStage.Weight = -1;
        else sortStage.createdAt = -1;

        const dataPipeline = [];
        if (source.toUpperCase() === "CSV") {
            dataPipeline.push(
                normalizeCsv,
                { $match: finalMatch }
            );
        } else if (source.toUpperCase() === "API") {
            dataPipeline.push(
                normalizeMain,
                { $match: finalMatch }
            );
        } else {
            dataPipeline.push(
                normalizeMain,
                { $match: finalMatch },
                {
                    $unionWith: {
                        coll: "csvdiamonds",
                        pipeline: [
                            normalizeCsv,
                            { $match: finalMatch }
                        ]
                    }
                }
            );
        }

        dataPipeline.push(
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    Shape: 1, Weight: 1, Color: 1, Clarity: 1, Cut: 1,
                    Polish: 1, Symmetry: 1, Lab: 1, Final_Price: 1, Price_Per_Carat: 1,
                    Diamond_Image: 1, Diamond_Video: 1, Certificate_Image: 1,
                    Availability: 1, Stock_No: 1, Stock_ID: 1,
                    Certificate_No: 1, source: 1, Measurements: 1,
                    Depth: 1, table_name: 1, Girdle: 1, Crown: 1, Pavilion: 1,
                    Culet: 1, Ratio: 1, Fluorescence: 1, Bgm: 1, Growth_Type: 1,
                    Location: 1
                }
            }
        );

        const diamonds = (source.toUpperCase() === "CSV")
            ? await CsvDiamond.aggregate(dataPipeline)
            : await Diamond.aggregate(dataPipeline);

        // Metadata handling
        let metadata = null;
        if (page === 1) {
            try {
                const metaPipeline = (field) => [
                    { $project: { [field]: { $ifNull: [`$${field}`, `$${field.toUpperCase()}`] } } },
                    {
                        $unionWith: {
                            coll: "csvdiamonds",
                            pipeline: [{ $project: { [field]: { $ifNull: [`$${field}`, `$${field.toUpperCase()}`] } } }]
                        }
                    },
                    { $group: { _id: null, values: { $addToSet: { $toUpper: { $trim: { input: { $ifNull: [`$${field}`, ""] } } } } } } }
                ];

                const [resShapes, resColors, resClarities] = await Promise.all([
                    Diamond.aggregate(metaPipeline("Shape")),
                    Diamond.aggregate(metaPipeline("Color")),
                    Diamond.aggregate(
                        metaPipeline("Clarity"))
                ]);

                metadata = {
                    shapes: (resShapes[0]?.values || []).filter(v => v && v !== ""),
                    colors: (resColors[0]?.values || []).filter(v => v && v !== "").sort(),
                    clarities: (resClarities[0]?.values || []).filter(v => v && v !== "").sort()
                };
            } catch (metaErr) {
                metadata = { shapes: [], colors: [], clarities: [] };
            }
        }

        res.status(200).json({
            success: true,
            data: diamonds,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            metadata
        });
    } catch (error) {
        console.error("Public Inventory Fetch Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSingleDiamond = async (req, res) => {
    try {
        const { id } = req.params;
        let diamond = null;

        // Try searching by MongoDB ID first
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            diamond = await Diamond.findById(id).lean() || await CsvDiamond.findById(id).lean();
        }

        // If not found by ID or if ID wasn't a mongo ID, try Stock_ID (Stock_No)
        if (!diamond) {
            diamond = await Diamond.findOne({ 
                $or: [{ Stock_ID: id }, { Stock_No: id }, { Certificate_No: id }] 
            }).lean() || await CsvDiamond.findOne({ 
                $or: [{ Stock_ID: id }, { Stock_No: id }, { Certificate_No: id }] 
            }).lean();
        }

        if (!diamond) {
            return res.status(404).json({ success: false, message: "Diamond not found" });
        }

        // Normalize for frontend
        const normalized = {
            ...diamond,
            source: diamond.csv_filename ? "CSV" : "API",
            Final_Price: diamond.Final_Price || diamond.SaleAmt || diamond.Price || 0,
            Reports: diamond.Report_No || diamond.Certificate_No || diamond.Stock_No || "None"
        };

        res.status(200).json({ success: true, data: normalized });
    } catch (error) {
        console.error("[GET_SINGLE_DIAMOND] Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getInventoryMetadata = async (req, res) => {
    try {
        const shapeMeta = await Diamond.distinct("Shape");
        const colorMeta = await Diamond.distinct("Color");
        const clarityMeta = await Diamond.distinct("Clarity");
        const priceRange = await Diamond.aggregate([
            { $group: { _id: null, min: { $min: "$Final_Price" }, max: { $max: "$Final_Price" } } }
        ]);
        const caratRange = await Diamond.aggregate([
            { $group: { _id: null, min: { $min: "$Weight" }, max: { $max: "$Weight" } } }
        ]);

        const metadata = {
            shapes: shapeMeta.filter(Boolean),
            colors: colorMeta.filter(Boolean),
            clarities: clarityMeta.filter(Boolean),
            priceMin: priceRange[0]?.min || 500,
            priceMax: priceRange[0]?.max || 20000,
            caratMin: caratRange[0]?.min || 0.1,
            caratMax: caratRange[0]?.max || 5
        };

        res.status(200).json({ success: true, metadata });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDiamondsData,
    getDiamondsCount,
    updateDaimondsData,
    deleteDaimond,
    addDiamond,
    bulkUpdateDiamonds,
    holdDiamond,
    releaseHold,
    getHeldDiamonds,
    getPublicInventory,
    getSingleDiamond,
    getInventoryMetadata
};
