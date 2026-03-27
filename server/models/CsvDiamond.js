const mongoose = require("mongoose");

const CsvDiamondSchema = new mongoose.Schema({
    Stock_ID: { type: String, unique: true, index: true },
    Shape: { type: String, index: true },
    Weight: { type: Number, index: true },
    Color: { type: String, index: true },
    Clarity: { type: String, index: true },
    Price: { type: Number, index: true },
    "Lab Report No": String,
    csv_filename: { type: String, index: true },
    extraData: mongoose.Schema.Types.Mixed 
}, { strict: false, timestamps: true });

CsvDiamondSchema.index({ createdAt: -1 });

// Index for fast searching
CsvDiamondSchema.index({ Shape: 1, Weight: 1, Price: 1 });

module.exports = mongoose.model("CsvDiamond", CsvDiamondSchema);
