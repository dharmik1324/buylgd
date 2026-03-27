const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    diamond: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Diamond",
        required: false
    },
    subject: {
        type: String,
        required: true
    },
    messages: [
        {
            sender: {
                type: String,
                enum: ["user", "admin"],
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    status: {
        type: String,
        enum: ["pending", "replied", "closed"],
        default: "pending"
    },
    appliedFilters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Support", supportSchema);
