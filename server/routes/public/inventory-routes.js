const express = require("express");
const router = express.Router();
const { getDiamondsData, getDiamondsCount, getPublicInventory } = require("../../controller/daimond/getDaimondsData");
const { getExternalDiamonds } = require("../../controller/external/externalApiController");

// Publicly accessible GET routes
router.get("/", getPublicInventory);
router.get("/count", getDiamondsCount);

// Dynamic Route: /api/inventory/:companyName
router.get("/:companyName", getExternalDiamonds);

module.exports = router;
