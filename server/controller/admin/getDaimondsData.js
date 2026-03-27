const Diamond = require("../../models/Diamond");

const getDaimondsData = async (req, res) => {
    try {
        const diamonds = await Diamond.find();
        res.status(200).json(diamonds);
    } catch (error) {
        console.error("Error fetching diamonds:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateDaimondsData = async (req, res) => {
    try {
        const diamond = await Diamond.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!diamond) {
            return res.status(404).json({ error: "Diamond not found" });
        }
        res.status(200).json(diamond);
    } catch (error) {
        console.error("Error updating diamond:", error);
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
        console.error("Error deleting diamond:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDaimondsData, updateDaimondsData, deleteDaimond };
