const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided or invalid format."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

        // Verify session still exists in DB
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        const sessionIndex = user.sessions.findIndex(s => s.sessionId === decoded.sessionId);

        // Admins have unlimited sessions and might not have sessionId tracking enforced yet
        // standard users must have a valid sessionId in their array
        if (decoded.role !== 'admin' && sessionIndex === -1) {
            return res.status(401).json({ success: false, message: "Session expired or logged out from this device." });
        }

        // Update last active time
        if (sessionIndex !== -1) {
            user.sessions[sessionIndex].lastActive = new Date();
            await user.save();
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = authMiddleware;
