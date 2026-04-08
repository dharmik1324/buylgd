const mongoose = require('mongoose');
(async () => {
    try {
        await mongoose.connect('mongodb+srv://diamond-firevy:diamond123@cluster0.hrqrxxb.mongodb.net/diamondDB');
        const Diamond = mongoose.connection.collection('diamonds');
        
        const markupFactor = 1;
        const normalizeMain = {
            $addFields: {
                Final_Price: { 
                    $round: [
                        { $multiply: [
                            { $convert: { 
                                input: { 
                                    $cond: [
                                        { $or: [{ $eq: ["$Final_Price", 0] }, { $eq: ["$Final_Price", null] }] },
                                        { $ifNull: ["$SaleAmt", "$Price", 0] },
                                        "$Final_Price"
                                    ]
                                }, 
                                to: "double", 
                                onError: 0, 
                                onNull: 0 
                            } },
                            markupFactor
                        ] },
                        2
                    ]
                }
            }
        };

        const sourceMatch = {};
        
        console.log("Running aggregate pipeline...");
        const result = await Diamond.aggregate([
            { $match: sourceMatch },
            normalizeMain,
            {
                $group: {
                    _id: "$Shape",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$Final_Price" }
                }
            }
        ]).toArray();
        
        console.log("Pipeline Result:", JSON.stringify(result, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
})();
