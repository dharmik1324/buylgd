const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    image: String,
    name: String,
    companyName: String,
    email: String,
    password: String,
    contact: String,
    country: String,
    state: String,
    city: String,
    role: {
        type: String,
        default: "user"
    },
    preferredDiamondType: {
        type: String,
        default: "All Diamonds"
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isApiOpen: {
        type: Boolean,
        default: false
    },
    apiPriceAdjustment: {
        type: Number,
        default: 0 // percentage or multiplier added to API diamonds
    },
    priceMarkup: {
        type: Number,
        default: 0 // percentage increment for inventory visibility
    },
    apiKey: {
        type: String,
        unique: true,
        sparse: true
    },
    savedFilters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    sessions: [{
        sessionId: String,
        userAgent: String,
        ip: String,
        lastActive: { type: Date, default: Date.now }
    }],
    resetOtp: {
        type: String,
        default: null
    },
    resetOtpExpires: {
        type: Date,
        default: null
    }
});

// Ensure apiKey is never saved as null to prevent index collisions
userSchema.pre("save", function () {
    if (this.apiKey === null) {
        this.apiKey = undefined;
    }
});

module.exports = mongoose.model("User", userSchema);