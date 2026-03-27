const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendApprovalEmail, sendWelcomeEmail } = require("../../utils/email-service");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        const originalUser = await User.findById(id);
        if (!originalUser) return res.status(404).json({ message: "User not found" });

        const wasApproved = originalUser.isApproved;
        const willBeApproved = updates.isApproved === true;

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!wasApproved && willBeApproved) {
            await sendApprovalEmail(user.email, user.name);
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, companyName, contact, country, state, city, image, isApproved } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
            companyName,
            contact,
            country,
            state,
            city,
            image,
            isApproved: isApproved !== undefined ? isApproved : false
        });

        await newUser.save();

        if (newUser.isApproved) {
            // Admin created and instantly approved this user
            await sendApprovalEmail(email, name);
        } else {
            // Normal registration flow
            await sendWelcomeEmail(email, name);
        }

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error("CREATE USER 500 ERROR:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { priceMarkup } = req.body;
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.isApproved = true;
        if (priceMarkup !== undefined) {
            user.priceMarkup = Number(priceMarkup) || 0;
        }
        await user.save();

        console.log(`[AUTH_CONTROLLER] User ${user.email} approved. Sending email...`);
        // Send approval email
        await sendApprovalEmail(user.email, user.name);

        res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error approving user", error: error.message });
    }
};

const toggleApiAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApiOpen } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isApproved) {
            return res.status(403).json({ message: "User must be approved before opening API" });
        }

        user.isApiOpen = !!isApiOpen;

        // No longer generating API key as per new requirements
        // user.apiKey = `BLGD-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;


        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: `API access ${user.isApiOpen ? "opened" : "closed"} successfully`,
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: "Error toggling API access", error: error.message });
    }
};

const updateUserFilters = async (req, res) => {
    try {
        const { id } = req.params;
        const { filters } = req.body;

        const user = await User.findByIdAndUpdate(id, { savedFilters: filters }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ success: true, filters: user.savedFilters });
    } catch (error) {
        res.status(500).json({ message: "Error updating filters", error: error.message });
    }
};

const clearUserSessions = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;

        // Only allow if requester is the user themselves OR an admin
        if (requesterId !== id && requesterRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized. You can only clear your own sessions." });
        }

        const user = await User.findById(id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.sessions = [];
        await user.save();

        res.status(200).json({ message: "All sessions cleared successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error clearing sessions", error: error.message });
    }
};

module.exports = { getAllUsers, deleteUser, updateUser, createUser, approveUser, toggleApiAccess, updateUserFilters, clearUserSessions };
