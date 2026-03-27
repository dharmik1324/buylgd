require("dotenv").config();
const { sendApprovalEmail } = require("./utils/email-service");

const testSendGrid = async () => {
    console.log("🚀 Starting SendGrid integration test...");
    console.log(`Using API Key: ${process.env.SENDGRID_API_KEY ? "EXISTS (starts with SG.)" : "MISSING"}`);
    console.log(`Using From Email: ${process.env.SENDGRID_FROM_EMAIL}`);
    
    const target = "admin.buylgd@gmail.com";
    console.log(`\n📧 Attempting to send test email to: ${target}`);

    try {
        const result = await sendApprovalEmail(target, "SendGrid Test User");
        if (result && result.success) {
            console.log("\n✅ SUCCESS! SendGrid sent the email.");
            console.log(`Message ID: ${result.messageId}`);
        } else if (result === true) {
            // This happens if fallback is triggered and successful or if it's skipped
            console.log("\n⚠️ SUCCESS, but look at logs - it might have fallen back to SMTP or been skipped.");
        } else {
            console.log("\n❌ FAILED. Check the console logs for SendGrid error details.");
        }
    } catch (err) {
        console.error("\n❌ CRITICAL ERROR during test:", err.message);
    }
};

testSendGrid();
