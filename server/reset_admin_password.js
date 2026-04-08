const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetAdminPassword() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected:", mongoose.connection.name);

  const newPassword = "buylgd@123";
  const newHash = await bcrypt.hash(newPassword, 10);

  const result = await mongoose.connection.db.collection("users").updateOne(
    { email: "admin.buylgd@gmail.com" },
    { $set: { password: newHash, role: "admin", isApproved: true } }
  );

  if (result.matchedCount === 0) {
    console.log("ERROR: admin.buylgd@gmail.com not found in DB!");
  } else if (result.modifiedCount === 1) {
    console.log("SUCCESS: Password updated!");
    console.log("  Email   : admin.buylgd@gmail.com");
    console.log("  Password: buylgd@123");
  } else {
    console.log("INFO: User found but nothing changed (may already be same).");
  }

  // Verify the update worked
  const user = await mongoose.connection.db.collection("users").findOne({ email: "admin.buylgd@gmail.com" });
  const match = user ? await bcrypt.compare(newPassword, user.password) : false;
  console.log("\nVerification — password 'buylgd@123' matches:", match);

  process.exit(0);
}

resetAdminPassword().catch(e => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
