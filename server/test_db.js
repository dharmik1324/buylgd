const mongoose = require('mongoose');
(async () => {
    try {
        await mongoose.connect('mongodb+srv://diamond-firevy:diamond123@cluster0.hrqrxxb.mongodb.net/diamondDB');
        const count = await mongoose.connection.collection('diamonds').countDocuments({});
        console.log(`TOTAL_DOCS: ${count}`);
        
        const stats = await mongoose.connection.collection('diamonds').aggregate([
            { $group: { _id: '$Shape', count: { $sum: 1 }, totalValue: { $sum: '$Final_Price' } } }
        ]).toArray();
        console.log("Shape_Stats:", JSON.stringify(stats, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
})();
