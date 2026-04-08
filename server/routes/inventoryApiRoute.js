const express = require("express");
const router = express.Router();
const {
    getInventoryApis,
    createInventoryApi,
    updateInventoryApi,
    deleteInventoryApi,
    testFetch,
    triggerManualSync,
    getSyncStatus
} = require("../controller/admin/inventoryApiController");

router.get("/sync-status", getSyncStatus);

router.get("/apis", getInventoryApis);
router.post("/apis", createInventoryApi);
router.post("/sync", triggerManualSync);
router.post("/test", testFetch);
router.put("/apis/:id", updateInventoryApi);
router.delete("/apis/:id", deleteInventoryApi);

module.exports = router;
