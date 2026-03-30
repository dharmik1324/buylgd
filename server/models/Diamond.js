const mongoose = require("mongoose");

const DiamondSchema = new mongoose.Schema({
    Stock_ID: { type: String, index: true },
    Shape: { type: String, index: true },
    Weight: { type: Number, index: true },
    Color: { type: String, index: true },
    Clarity: { type: String, index: true },
    Cut: { type: String, index: true },
    Polish: { type: String, index: true },
    Symmetry: { type: String, index: true },
    Discounts: { type: Number, index: true },
    Lab: { type: String, index: true },
    Final_Price: { type: Number, index: true },
    Diamond_Image: String,
    Availability: { type: String, default: "In Stock", index: true },
    Source: { type: String, index: true },
    onHold: { type: Boolean, default: false, index: true },
    holdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    holdExpiresAt: Date
}, { strict: false, timestamps: true });


DiamondSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Diamond", DiamondSchema);
