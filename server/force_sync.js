const mongoose = require("mongoose");
const Diamond = require("./models/Diamond");
const CsvDiamond = require("./models/CsvDiamond");
const InventoryApi = require("./models/InventoryApi");
const { syncInventoryFromApis } = require("./utils/diamondSync");
require("dotenv").config();

async function forceSync() {
  console.log("CONNECTING TO:", process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("CONNECTED.");
  
  const apiCount = await InventoryApi.countDocuments({ isActive: true });
  console.log("ACTIVE APIS IN DB:", apiCount);
  
  if (apiCount === 0) {
    console.log("NO ACTIVE APIS! Creating default...");
    await InventoryApi.create({
        name: "Akshar API",
        url: "https://akshar.kodllin.com/apis/api/getStockN?auth_key=zvkwybd3mqru",
        method: "POST",
        isActive: true
    });
  }

  console.log("STARTING SYNC...");
  const result = await syncInventoryFromApis();
  console.log("SYNC RESULT:", result);
  
  const finalCount = await Diamond.countDocuments();
  console.log("FINAL DIAMOND COUNT IN DB:", finalCount);
}

forceSync().then(() => process.exit(0)).catch(e => { console.error("FORCE SYNC FAILED:", e); process.exit(1); });
