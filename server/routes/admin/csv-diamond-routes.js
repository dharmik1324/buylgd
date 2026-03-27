const express = require("express");
const router = express.Router();
const multer = require("multer");
const { 
    uploadCsvToDedicate, 
    clearCsvCollection, 
    getCsvDiamonds,
    getImportedFiles,
    deleteDiamondsByFile
} = require("../../controller/admin/csvDiamondController");
const authMiddleware = require("../../middleware/auth-middleware");

const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.array("files"), uploadCsvToDedicate);
router.delete("/clear", authMiddleware, clearCsvCollection);
router.get("/list", authMiddleware, getCsvDiamonds);
router.get("/files", authMiddleware, getImportedFiles);
router.delete("/clear-by-file", authMiddleware, deleteDiamondsByFile);

module.exports = router;
