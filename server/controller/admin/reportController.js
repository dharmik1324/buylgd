const AccessLog = require("../../models/AccessLog");

const getAccessLogs = async (req, res) => {
    try {
        const { statusType, page = 1, limit = 10 } = req.query;
        let query = {};

        if (statusType && statusType !== "all") {
            query.statusType = statusType;
        }

        const logs = await AccessLog.find(query)
            .sort({ time: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AccessLog.countDocuments(query);

        const totalLogs = await AccessLog.countDocuments();
        const successCount = await AccessLog.countDocuments({ statusType: "success" });
        const mfaCount = await AccessLog.countDocuments({ statusType: "mfa" }); // Placeholder for future
        const failedCount = await AccessLog.countDocuments({ statusType: "failed" });

        res.status(200).json({
            logs,
            totalLogs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            stats: {
                successRate: totalLogs > 0 ? ((successCount / totalLogs) * 100).toFixed(1) : 0,
                failedCount,
                mfaCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
};

module.exports = { getAccessLogs };
