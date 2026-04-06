const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth-middleware");

const diamondRoutes = require("./routes/diamond/getDaimonds-routes");
const storeDaimonds = require("./routes/diamond/storeDaimonds-routes");
const authRoutes = require("./routes/auth/auth-routes");
const contactRoutes = require("./routes/contact/contact-routes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const supportRoutes = require("./routes/support/support-routes");
const externalRoutes = require("./routes/external/external-routes");
const inventoryRoutes = require("./routes/public/inventory-routes");
const inventoryApiRoutes = require("./routes/inventoryApiRoute");


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admins");
    console.log("Admin joined room");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(cors({
  origin: true, // Echoes the origin from the request, allowing all origins during development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.use(express.json());

// Add Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

// Improved Diagnostic route
app.get("/api/diag/email-status", async (req, res) => {
  const user = process.env.SMTP_USER;
  const isTest = req.query.test === "true";
  const dns = require('dns');
  
  const { verifySMTP, sendMail } = require("./utils/email-service");
  const connection = await verifySMTP();

  // Diagnostic DNS check within the endpoint
  let resolved_ip = null;
  try {
    resolved_ip = await new Promise((resolve) => {
      dns.lookup("smtp.gmail.com", { family: 4 }, (err, addr) => resolve(err ? err.message : addr));
    });
  } catch (e) {
    resolved_ip = e.message;
  }

  const results = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    configured: !!(user && process.env.SMTP_PASS),
    smtp_user: user ? `${user.substring(0, 3)}...` : "not set",
    smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
    dns_resolved_ipv4: resolved_ip,
    connection_test: connection
  };

  if (isTest && user) {
    const testResult = await sendMail({
      to: user,
      subject: "BUYLGD Email Test",
      html: "<h1>Email System working!</h1>"
    });
    results.send_test = testResult;
  } else if (isTest) {
    results.send_test = { success: false, error: "SMTP_USER not set" };
  } else {
    results.hint = "Add ?test=true to the URL to try sending a real test email.";
  }

  res.json(results);
});

const csvDiamondRoutes = require("./routes/admin/csv-diamond-routes");

// Protected Admin Routes
app.use("/api/admin/csv-diamonds", csvDiamondRoutes);
app.use("/api/admin/inventory-api", authMiddleware, inventoryApiRoutes);
app.use("/api/contact", authMiddleware, contactRoutes);

app.use("/api/admin/reports", authMiddleware, reportRoutes);
app.use("/api/admin/store-diamonds", authMiddleware, storeDaimonds);
app.use("/api/admin/diamonds", authMiddleware, diamondRoutes);
app.use("/api/admin/notifications", authMiddleware, notificationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api", externalRoutes);

(async () => {
  const tryConnect = async (uri) => {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log("MongoDB connected");
      return true;
    } catch (err) {
      if (err && err.code === 'ENOTFOUND' && err.syscall === 'querySrv') {
        console.error('DNS SRV lookup failed for MongoDB+SRV URI:', err.message);
      } else {
        console.error('MongoDB connection error:', err.message || err);
      }
      return false;
    }
  };

  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/diamond';

  if (!primaryUri) {
    console.warn('MONGO_URI is not set. Using fallback local MongoDB URI.');
    await tryConnect(fallbackUri);
  } else {
    const ok = await tryConnect(primaryUri);
    if (!ok) {
      console.log('Attempting fallback MongoDB URI...');
      await tryConnect(fallbackUri);
    }
  }

  // ensure default admin exists (email and password configured via env or defaults)
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin.buylgd@gmail.com";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "firevy";

    // SMTP Verification log
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️  SMTP_USER or SMTP_PASS is missing in .env! Emails will not work.");
    } else {
      console.log("✅ SMTP Configuration detected for:", process.env.SMTP_USER);
    }

    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Administrator",
        email: adminEmail,
        password: hashed,
        role: "admin",
        isApproved: true,
      });
      console.log(`Default admin created (${adminEmail})`);
    } else if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isApproved = true;
      await existing.save();
      console.log(`User ${adminEmail} promoted to admin.`);
    }
    } catch (err) {
      console.error("Error ensuring default admin:", err.message || err);
    }

    // Ensure default Inventory API exists
    try {
        const InventoryApi = require("./models/InventoryApi");
        const apisCount = await InventoryApi.countDocuments();
        if (apisCount === 0) {
            await InventoryApi.create({
                name: "Akshar API",
                url: "https://akshar.kodllin.com/apis/api/getStockN?auth_key=zvkwybd3mqru",
                method: "POST",
                isActive: true
            });
            console.log("Default Akshar API created.");
        }
    } catch (err) {
        console.error("Error ensuring default API:", err.message || err);
    }

    // --- BACKGROUND SYNCHRONIZATION ---
    // Added by Antigravity: Ensure data is always fresh on server start and every 1 hour
    const { syncInventoryFromApis } = require("./utils/diamondSync");
    
    /*
    // 1. Initial background sync (5 seconds after startup to allow full connection)
    setTimeout(() => {
        console.log("[STARTUP] Triggering initial background sync from external APIs...");
        syncInventoryFromApis().catch(err => {
            console.error("[STARTUP] Initial sync failed:", err.message);
        });
    }, 5000);
    */

    // 2. Periodic sync (Every 1 hour)
    const SYNC_INTERVAL = 60 * 60 * 1000; 
    setInterval(() => {
        console.log("[CRON] Running scheduled synchronization...");
        syncInventoryFromApis().catch(err => {
            console.error("[CRON] Scheduled sync failed:", err.message);
        });
    }, SYNC_INTERVAL);


  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
