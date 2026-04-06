const express = require("express");
const router = express.Router();
const { getDiamondsData, getDiamondsCount, getPublicInventory, getSingleDiamond, getInventoryMetadata } = require("../../controller/daimond/getDaimondsData");
const { getExternalDiamonds } = require("../../controller/external/externalApiController");

// Publicly accessible GET routes
router.get("/", getPublicInventory);
router.get("/metadata", getInventoryMetadata);
router.get("/count", getDiamondsCount);
router.get("/detail/:id", getSingleDiamond);

// Dynamic Route: /api/inventory/:companyName
router.get("/:companyName", getExternalDiamonds);

module.exports = router;
