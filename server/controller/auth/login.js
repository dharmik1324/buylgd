const User = require("../../models/User");
const AccessLog = require("../../models/AccessLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createNotification } = require("../admin/notificationController");
const crypto = require("crypto");

const login = async (req, res) => {
    const { email, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] || req.ip || "Unknown").split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || "Unknown Environment";

    // Clean up user agent for display
    let env = "Desktop / Windows";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) env = "Mobile / iOS";
    else if (userAgent.includes("Android")) env = "Mobile / Android";
    else if (userAgent.includes("Macintosh")) env = "Desktop / macOS";
    else if (userAgent.includes("Linux")) env = "Desktop / Linux";

    try {
        const user = await User.findOne({ email });

        if (!user) {
            await new AccessLog({
                user: "Unknown User",
                email: email,
                ip,
                env,
                loc: "Remote Access",
                status: "FAILED ATTEMPT",
                statusType: "failed",
                highlight: true
            }).save();
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await new AccessLog({
                user: user.name,
                email: user.email,
                ip,
                env,
                loc: "Remote Access",
                status: "PASSWORD MISMATCH",
                statusType: "failed",
                highlight: true
            }).save();

            await createNotification({
                title: "Failed Login Attempt",
                message: `Invalid password for ${user.email} from ${ip}`,
                type: "alert",
                icon: "shield-alert",
                link: "/admin/logs",
                metadata: { email: user.email, ip }
            });

            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check for admin approval if user is not an admin
        if (user.role !== "admin" && !user.isApproved) {
            await new AccessLog({
                user: user.name,
                email: user.email,
                ip,
                env,
                loc: "Remote Access",
                status: "UNAUTHORIZED ACCESS",
                statusType: "failed",
                highlight: true
            }).save();

            await createNotification({
                title: "Unauthorized Access Attempt",
                message: `${user.name} (${user.email}) tried to login but is not approved`,
                type: "alert",
                icon: "shield-x",
                link: "/admin/users",
                metadata: { userName: user.name, email: user.email }
            });

            return res.status(403).json({
                message: "Your registration is currently pending administrator approval. You will receive an email once your access is granted."
            });
        }

        // --- SESSION TRACKING & CLEANUP ---
        const now = new Date();
        const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours

        // 1. Clean up stale sessions (no activity for 24h)
        user.sessions = user.sessions.filter(s => (now - new Date(s.lastActive)) < staleThreshold);

        // 2. Check for existing session from same device to avoid duplicates
        const existingSessionIndex = user.sessions.findIndex(s => s.ip === ip && s.userAgent === userAgent);
        
        if (existingSessionIndex !== -1) {
            user.sessions.splice(existingSessionIndex, 1);
        }

        const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

        // Add the new session - Concurrent logins are now ALLOWED by user request
        user.sessions.push({
            sessionId,
            userAgent,
            ip,
            lastActive: new Date()
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, sessionId },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "7d" }
        );

        await new AccessLog({
            user: user.name,
            email: user.email,
            ip,
            env,
            loc: "Internal Network",
            status: user.role === 'admin' ? "CORE SUCCESS" : "SUCCESS",
            statusType: "success",
            highlight: false
        }).save();

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                companyName: user.companyName,
                isApiOpen: user.isApiOpen
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.user.sessionId;

        const user = await User.findById(userId);
        if (user) {
            user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
            await user.save();
        }

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error during logout" });
    }
};

module.exports = { login, logout };
