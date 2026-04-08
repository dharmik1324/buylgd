const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin.buylgd@gmail.com";
  const user = await User.findOne({ email: adminEmail.toLowerCase().trim() });
  
  if (!user) {
    console.log("ADMIN USER NOT FOUND IN DB!");
  } else {
    console.log("ADMIN USER FOUND:");
    console.log("- Name:", user.name);
    console.log("- Email:", user.email);
    console.log("- Role:", user.role);
    console.log("- IsApproved:", user.isApproved);
    console.log("- Has Password:", !!user.password);
    
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(process.env.DEFAULT_ADMIN_PASSWORD || "firevy", user.password);
    console.log("- Password 'firevy' matches:", isMatch);
  }
}

checkAdmin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
