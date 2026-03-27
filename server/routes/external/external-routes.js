const express = require("express");
const router = express.Router();
const { getExternalDiamonds } = require("../../controller/external/externalApiController");

// Dynamic Route: /api/:companyName
router.get("/:companyName", getExternalDiamonds);

module.exports = router;
