const mongoose = require("mongoose");

const InventoryApiSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },

    method: {
        type: String,
        enum: ["GET", "POST"],
        default: "GET",
        required: true
    },
    body: {
        type: String,
        default: ""
    },
    headers: {
        type: String,
        default: ""
    },
    isActive: {


        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("InventoryApi", InventoryApiSchema);
