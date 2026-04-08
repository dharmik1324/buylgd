const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}, {
    projection: { password: 1, email: 1, role: 1, isApproved: 1, name: 1 }
  }).toArray();

  console.log(`\nTotal users in DB: ${users.length}\n`);
  for (const u of users) {
    const matchFirevy = u.password ? await bcrypt.compare("firevy", u.password) : false;
    console.log(`Email: ${u.email}`);
    console.log(`  Name: ${u.name} | Role: ${u.role} | Approved: ${u.isApproved}`);
    console.log(`  Password=firevy: ${matchFirevy}`);
    console.log("");
  }
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
