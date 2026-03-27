const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema({
    user: {
        type: String,
        default: "Unknown User"
    },
    email: String,
    time: {
        type: Date,
        default: Date.now
    },
    ip: String,
    env: String,
    loc: String,
    status: String, // SUCCESS, MFA VERIFIED, FAILED ATTEMPT, etc.
    statusType: {
        type: String,
        enum: ["success", "mfa", "failed"],
        default: "success"
    },
    highlight: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("AccessLog", accessLogSchema);
