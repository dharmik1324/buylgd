const mongoose = require("mongoose");
require("dotenv").config();

async function diag() {
  await mongoose.connect(process.env.MONGO_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("COLLECTIONS IN DB:");
  collections.forEach(c => console.log("- " + c.name));
  
  const Diamond = mongoose.connection.collection("diamonds");
  const CsvDiamond = mongoose.connection.collection("csvdiamonds");
  
  const dCount = await Diamond.countDocuments();
  const cCount = await CsvDiamond.countDocuments();
  
  console.log("\nCOUNTS:");
  console.log("- diamonds:", dCount);
  console.log("- csvdiamonds:", cCount);
  
  if (dCount > 0) {
    const sample = await Diamond.findOne();
    console.log("\nSAMPLE DIAMOND KEYS:", Object.keys(sample));
  }
}

diag().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
