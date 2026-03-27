const { sendApprovalEmail } = require("./utils/email-service");

const testAppEmail = async () => {
    console.log("Starting APP email system test...");
    const target = "admin.buylgd@gmail.com";
    console.log(`Sending to: ${target}`);

    try {
        const result = await sendApprovalEmail(target, "Master Admin Test");
        if (result) {
            console.log("✅ SUCCESS: The project's mail system sent the email!");
        } else {
            console.error("❌ FAILED: The project's mail system returned false.");
        }
    } catch (err) {
        console.error("❌ CRITICAL ERROR during test:", err);
    }
};

testAppEmail();
