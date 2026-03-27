const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storeDaimond, uploadCsv, clearInventory } = require("../../controller/admin/storeDaimondsData");

const upload = multer({ dest: "uploads/" });

router.get("/store", storeDaimond);
router.post("/upload-csv", upload.single("file"), uploadCsv);
router.delete("/clear", clearInventory);

module.exports = router;