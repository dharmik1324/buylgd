const express = require("express");
const router = express.Router();
const Contact = require("../../models/Contact");
const { createNotification } = require("../../controller/admin/notificationController");
const { sendContactEmail } = require("../../utils/email-service");

router.post("/submit", async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;

        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newContact = new Contact({
            fullName,
            email,
            subject,
            message
        });

        await newContact.save();

        // Create notification for admin
        createNotification({
            title: "New Contact Message",
            message: `${fullName} sent a message: "${subject}"`,
            type: "contact",
            icon: "mail",
            link: "",
            metadata: { contactName: fullName, contactEmail: email, subject }
        }).catch(err => console.error("Notification Error:", err));

        // Send Email to Admin (Await for reliability)
        await sendContactEmail({ fullName, email, subject, message });

        res.status(201).json({
            success: true,
            message: "Message sent successfully"
        });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

module.exports = router;
