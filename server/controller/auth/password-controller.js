const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendForgotPasswordEmail, sendPasswordResetSuccessEmail } = require("../../utils/email-service");

/**
 * Request Password Reset (ForgotPassword)
 * Generates OTP and sends email
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email address" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiry to 10 minutes from now
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        user.resetOtp = otp;
        user.resetOtpExpires = expires;
        await user.save();

        // Send Email (Await for reliability)
        const emailResult = await sendForgotPasswordEmail(user.email, user.name || "User", otp);

        if (!emailResult.success) {
            console.error("FORGOT PASSWORD EMAIL FAILED:", emailResult.error);
            return res.status(500).json({ 
                message: "Failed to send reset email. Please try again later.",
                error: emailResult.error
            });
        }

        return res.status(200).json({ message: "A 6-digit OTP has been sent to your email" });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Verify OTP and Reset Password
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ 
            email: normalizedEmail, 
            resetOtp: otp,
            resetOtpExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetOtp = null;
        user.resetOtpExpires = null;
        
        await user.save();

        // Send Success Email (Await for reliability)
        await sendPasswordResetSuccessEmail(user.email, user.name || "User");

        res.status(200).json({ message: "Password updated successfully. You can now login." });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { forgotPassword, resetPassword };
