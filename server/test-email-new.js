require("dotenv").config();
const { verifySMTP, sendMail } = require("./utils/email-service");

(async () => {
    console.log("--- Starting Email Service Test (Using Port 465) ---");
    
    console.log("1. Verifying SMTP connection...");
    const connection = await verifySMTP();
    console.log("Connection Result:", JSON.stringify(connection, null, 2));

    if (connection.success) {
        console.log("\n2. Attempting to send test email to a DIFFERENT user...");
        // Use one of the user's test emails
        const recipient = "variyahemanshu01@gmail.com"; 
        
        const sendResult = await sendMail({
            to: recipient,
            subject: "Verification Test (External User)",
            html: "<h1>This email is verified!</h1><p>It was sent successfully via SMTP to an external user.</p>"
        });
        console.log("Send Result:", JSON.stringify(sendResult, null, 2));
    } else {
        console.log("\nSMTP verification failed.");
    }

    console.log("\n--- Test Complete ---");
})();
