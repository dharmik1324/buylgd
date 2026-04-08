const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function listAdmins() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB:", mongoose.connection.name);
  
  const allAdmins = await User.find({ role: "admin" }).select("-sessions");
  console.log(`\nFound ${allAdmins.length} admin user(s):\n`);

  for (const u of allAdmins) {
    console.log("---");
    console.log("Name    :", u.name);
    console.log("Email   :", u.email);
    console.log("Role    :", u.role);
    console.log("Approved:", u.isApproved);
    console.log("HasPwd  :", !!u.password);
    const matchFirevy = await bcrypt.compare("firevy", u.password || "").catch(() => false);
    console.log("Pwd=firevy?", matchFirevy);
  }

  console.log("\n--- All Users (role=user, not approved) ---");
  const pending = await User.find({ role: "user", isApproved: false }).select("name email createdAt");
  pending.forEach(u => console.log(`  PENDING: ${u.name} (${u.email})`));
}

listAdmins().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
