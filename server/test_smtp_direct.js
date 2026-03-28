const nodemailer = require("nodemailer");
require("dotenv").config();

async function testSMTP() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    console.log(`Testing SMTP for: ${user}`);
    console.log(`Host: ${host}, Port: ${port}, Secure: ${secure}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP Verification successful!");
        
        const testMail = {
            from: `"SMTP Test" <${user}>`,
            to: "dharmikprajapati36@gmail.com", // testing with the only one that works too
            subject: "SMTP Direct Test",
            text: "This is a test email sent using direct SMTP config."
        };

        const info = await transporter.sendMail(testMail);
        console.log("✅ Email sent successfully:", info.messageId);
        
        const testMailAll = {
            from: `"SMTP Test" <${user}>`,
            to: "test@example.com", // test another recipient
            subject: "SMTP Global Test",
            text: "This is a test email to verify it works for everyone."
        };
        const info2 = await transporter.sendMail(testMailAll);
        console.log("✅ Email to others also sent successfully:", info2.messageId);

    } catch (err) {
        console.error("❌ SMTP Error:", err);
    }
}

testSMTP();
