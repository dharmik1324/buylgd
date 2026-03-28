const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const dns = require('dns');
require("dotenv").config();

// Force IPv4-only resolution to avoid ENETUNREACH IPv6 issues on Render
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

// Resend initialization (Primary)
const resend = (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_123456789") ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Creates a configured nodemailer transporter for Gmail/SMTP
 */
const createTransporter = (forcePort = null) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    
    // If it's Gmail, we strongly prefer using the 'service' option which handles configuration automatically
    const isGmail = host.includes("gmail.com") || host.includes("googlemail.com") || (user && user.includes("gmail.com"));
    
    // Decide the port: prioritize forcePort, then .env, then default to 465 (SSL) for reliability
    let port = forcePort;
    if (!port) {
        port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : (isGmail ? 465 : 587);
    }
    
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    if (!user || !pass) return null;

    let transporterConfig;

    if (isGmail) {
        // Optimized Gmail Config for Cloud Environments
        transporterConfig = {
            service: 'gmail',
            auth: { user, pass },
            tls: { 
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            },
            pool: true, // Use pooling for better performance
            maxConnections: 5,
            maxMessages: 100,
            family: 4 // Force IPv4
        };
    } else {
        // Generic SMTP Config
        transporterConfig = {
            host,
            port,
            secure,
            auth: { user, pass },
            tls: { 
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            },
            family: 4
        };
    }

    // Add DNS lookup fix for Render/Cloud if host is used
    if (!isGmail) {
        transporterConfig.lookup = (hostname, options, callback) => {
            dns.lookup(hostname, { family: 4 }, (err, address, family) => {
                callback(err, address, family || 4);
            });
        };
    }

    return nodemailer.createTransport(transporterConfig);
};

/**
 * Primary sending function with fallback mechanism
 * Priority: 1. SMTP (More reliable for global recipients if configured correctly)
 *           2. Resend (fallback but limited to owner if not verified)
 */
const sendMail = async (options) => {
    let smtpError = null;

    // 1. Try Configured SMTP First (Gmail / Other)
    const transporter = createTransporter();
    
    if (transporter) {
        if (!options.from) {
            options.from = `"BUYLGD" <${process.env.SMTP_USER}>`;
        }

        try {
            console.log(`[EMAIL_SERVICE] Attempting SMTP sending to: ${options.to}`);
            
            // For Gmail, we sometimes need to force the 'from' to match the auth user
            if (process.env.SMTP_HOST?.includes("gmail") || process.env.SMTP_USER?.includes("gmail")) {
                options.from = process.env.SMTP_USER;
            }

            const info = await transporter.sendMail(options);
            console.log(`[EMAIL_SERVICE] ✅ SMTP success: ${info.messageId}`);
            return { success: true, method: 'smtp', id: info.messageId };
        } catch (err) {
            smtpError = err.message;
            console.error(`[EMAIL_SERVICE] ❌ SMTP Primary failed:`, smtpError);

            // AUTO-RETRY on Port 465 if we weren't already using it
            if (transporter.options.port !== 465) {
                console.log(`[EMAIL_SERVICE] 🔄 Retrying via Port 465 (SSL)...`);
                try {
                    const retryTransporter = createTransporter(465);
                    const info = await retryTransporter.sendMail(options);
                    console.log(`[EMAIL_SERVICE] ✅ SMTP success on retry!`);
                    return { success: true, method: 'smtp_retry', id: info.messageId };
                } catch (retryErr) {
                    smtpError += ` | Retry Error: ${retryErr.message}`;
                    console.error(`[EMAIL_SERVICE] ❌ SMTP Retry also failed.`);
                }
            }
        }
    } else {
        smtpError = "SMTP not configured (check .env)";
    }

    // 2. Fallback to Resend
    // IMPORTANT: If domain is not verified in Resend, this will ONLY work for the account owner!
    if (resend) {
        try {
            console.log(`[EMAIL_SERVICE] ⚠️ Falling back to Resend for: ${options.to}`);
            
            const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
            
            const { data, error } = await resend.emails.send({
                from: `"BUYLGD" <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            if (error) {
                console.error("[EMAIL_SERVICE] ❌ Resend error:", error);
                return { success: false, error: smtpError, resendError: error };
            }

            console.log(`[EMAIL_SERVICE] ✅ Resend success: ${data.id}`);
            return { success: true, method: 'resend', id: data.id };
        } catch (err) {
            console.error("[EMAIL_SERVICE] ❌ Resend exception:", err.message);
            return { success: false, error: smtpError, resendError: err.message };
        }
    }

    return { 
        success: false, 
        error: smtpError || "No email provider available",
        hint: "Ensure SMTP credentials are correct. If using Resend, verify your domain to send to all users."
    };
};

/**
 * Premium Email Template Wrapper
 */
const getEmailTemplate = ({ title, body, badge, buttonText, buttonUrl, footerNote }) => {
    const primaryColor = "#1e40af"; // Deep blue
    const accentColor = "#eff6ff"; // Light blue background
    const badgeColor = badge === "ACCOUNT APPROVED" ? "#dcfce7" : "#fef9c3";
    const badgeTextColor = badge === "ACCOUNT APPROVED" ? "#166534" : "#854d0e";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; color: #1f2937; }
            .header { background-color: ${primaryColor}; padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; }
            .content { padding: 40px 30px; background-color: white; }
            .badge { display: inline-block; padding: 6px 16px; background-color: ${badgeColor}; color: ${badgeTextColor}; border-radius: 50px; font-size: 13px; font-weight: 700; margin-bottom: 25px; text-transform: uppercase; }
            .title { font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #111827; }
            .body-text { line-height: 1.6; font-size: 16px; color: #4b5563; margin-bottom: 30px; }
            .button-wrapper { text-align: center; margin: 40px 0; }
            .button { background-color: #2563eb; color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BUYLGD</h1>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                ${badge ? `<div class="badge">${badge}</div>` : ''}
                <div class="body-text">
                    ${body}
                </div>
                ${buttonText ? `
                <div class="button-wrapper">
                    <a href="${buttonUrl}" class="button">${buttonText}</a>
                </div>
                ` : ''}
                ${footerNote ? `<p style="font-size: 14px; color: #9ca3af; margin-top: 40px; border-top: 1px solid #f3f4f6; pt: 20px;">${footerNote}</p>` : ''}
            </div>
            <div class="footer">
                <p><strong>BUYLGD Luxury Diamonds</strong></p>
                <p>&copy; ${new Date().getFullYear()} BUYLGD. All rights reserved.</p>
                <p>You received this email because your account was approved at BUYLGD.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Logic-specific Email Functions
 */

const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        to: email,
        subject: "Welcome to BUYLGD - Registration Received",
        html: getEmailTemplate({
            title: `Hello ${name},`,
            body: `
                <p>We are pleased to inform you that your registration with <strong>BUYLGD Diamond Inventory</strong> has been received by our administrators.</p>
                <p>Our team will review your application within 24-48 business hours.</p>
                <p>Once approved, you will have full access to our premium diamond catalog and advanced search features.</p>
            `,
            badge: "REGISTRATION RECEIVED",
            footerNote: "If you have any trouble logging in, please try resetting your password or contact our 24/7 support team."
        })
    };
    return await sendMail(mailOptions);
};

const sendApprovalEmail = async (userEmail, userName) => {
    const mailOptions = {
        to: userEmail,
        subject: "✅ Your BUYLGD account has been approved!",
        html: getEmailTemplate({
            title: `Hello ${userName},`,
            badge: "ACCOUNT APPROVED",
            body: `
                <p>We are pleased to inform you that your registration with <strong>BUYLGD Diamond Inventory</strong> has been approved by our administrators.</p>
                <p>You now have full access to our premium diamond catalog and advanced search features. Your journey into the world of exquisite diamonds starts here.</p>
            `,
            buttonText: "Access My Account",
            buttonUrl: `${process.env.APP_URL || 'https://app.buylgd.in'}/login`,
            footerNote: "If you have any trouble logging in, please try resetting your password or contact our 24/7 support team."
        })
    };
    return await sendMail(mailOptions);
};

const sendAdminNotificationEmail = async (userData) => {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
        to: adminEmail,
        subject: "Alert: New User Registration",
        html: getEmailTemplate({
            title: "New Registration",
            body: `
                <p>A new user is awaiting approval:</p>
                <p><strong>Name:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Company:</strong> ${userData.companyName}</p>
                <p><strong>Location:</strong> ${userData.city}, ${userData.country}</p>
            `,
            badge: "ADMIN ACTION REQUIRED",
            buttonText: "View User in Dashboard",
            buttonUrl: `${process.env.APP_URL || 'https://app.buylgd.in'}/admin/users`
        })
    };
    return await sendMail(mailOptions);
};

const sendForgotPasswordEmail = async (userEmail, userName, otp) => {
    const mailOptions = {
        to: userEmail,
        subject: "Password Reset Request - BUYLGD",
        html: getEmailTemplate({
            title: `Hello ${userName},`,
            body: `
                <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0; color: #1e40af;">
                    ${otp}
                </div>
                <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
            `,
            badge: "PASSWORD RESET",
        })
    };
    return await sendMail(mailOptions);
};

const sendPasswordResetSuccessEmail = async (userEmail, userName) => {
    const mailOptions = {
        to: userEmail,
        subject: "Password Changed - BUYLGD",
        html: getEmailTemplate({
            title: `Success!`,
            body: `<p>Hello ${userName}, your password has been changed successfully. You can now log in with your new credentials.</p>`,
            badge: "SECURITY UPDATE",
            buttonText: "Login Now",
            buttonUrl: `${process.env.APP_URL || 'https://app.buylgd.in'}/login`
        })
    };
    return await sendMail(mailOptions);
};

const sendContactEmail = async (contactData) => {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
        to: adminEmail,
        subject: `Contact inquiry: ${contactData.subject}`,
        html: getEmailTemplate({
            title: "New Inquiry Received",
            body: `
                <p><strong>From:</strong> ${contactData.fullName} (${contactData.email})</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="padding: 15px; background: #f9fafb; border-left: 4px solid #1e40af; font-style: italic;">
                    ${contactData.message}
                </div>
            `,
            badge: "CUSTOMER SUPPORT"
        })
    };
    return await sendMail(mailOptions);
};

const verifySMTP = async () => {
    const transporter = createTransporter();
    if (!transporter) return { success: false, message: "SMTP not configured" };
    try {
        await transporter.verify();
        return { 
            success: true, 
            message: "SMTP connection verified!",
            host: transporter.options.host || "gmail (service)",
            port: transporter.options.port || (transporter.options.service === 'gmail' ? 'default' : 'unknown'),
            resendActive: !!resend
        };
    } catch (err) {
        return { 
            success: false, 
            message: `SMTP Error: ${err.message}`, 
            host: transporter.options.host || "gmail (service)",
            port: transporter.options.port || (transporter.options.service === 'gmail' ? 'default' : 'unknown'),
            resendActive: !!resend
        };
    }
};

module.exports = { 
    sendMail,
    sendApprovalEmail, 
    sendWelcomeEmail, 
    sendForgotPasswordEmail, 
    sendPasswordResetSuccessEmail,
    sendAdminNotificationEmail,
    sendContactEmail,
    verifySMTP
};
