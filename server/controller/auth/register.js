const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { createNotification } = require("../admin/notificationController");
const { sendWelcomeEmail, sendAdminNotificationEmail } = require("../../utils/email-service");

const register = async (req, res) => {
    try {
        const { name, companyName, email, password, contact, country, state, city } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const existingCompany = await User.findOne({ companyName });
        if (existingCompany) {
            return res.status(400).json({ message: "Company name already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            companyName,
            email: normalizedEmail,
            password: hashedPassword,
            contact,
            country,
            state,
            city,
            isApproved: false,
        });

        await newUser.save();

        // Create persisted notification and emit via socket (Background)
        createNotification({
            title: "New User Registration",
            message: `${name} (${email}) just registered and is awaiting approval`,
            type: "registration",
            icon: "user-plus",
            link: "/admin/users",
            metadata: { userName: name, userEmail: email }
        }).catch(err => console.error("Notification Error:", err));
        
        // Send welcome email (Await for reliability on cloud platforms)
        try {
            await sendWelcomeEmail(email, name);
        } catch (err) {
            console.error("Welcome Email Error:", err);
        }

        // Notify admin via email
        try {
            await sendAdminNotificationEmail({ name, email, companyName, contact, country, state, city });
        } catch (err) {
            console.error("Admin Notification Email Error:", err);
        }

        return res.status(201).json({
            message: "User registered successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error registering user" });
    }
};

module.exports = { register };
