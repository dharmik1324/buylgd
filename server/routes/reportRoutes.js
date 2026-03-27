const express = require("express");
const router = express.Router();
const { getAccessLogs } = require("../controller/admin/reportController");

// In a real app, you would add admin middleware here
router.get("/access-logs", getAccessLogs);

module.exports = router;
