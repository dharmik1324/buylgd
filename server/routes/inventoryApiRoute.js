const express = require("express");
const router = express.Router();
const {
    getInventoryApis,
    createInventoryApi,
    updateInventoryApi,
    deleteInventoryApi
} = require("../controller/admin/inventoryApiController");

router.get("/apis", getInventoryApis);
router.post("/apis", createInventoryApi);
router.put("/apis/:id", updateInventoryApi);
router.delete("/apis/:id", deleteInventoryApi);

module.exports = router;
