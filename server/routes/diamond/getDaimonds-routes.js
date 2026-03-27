const express = require("express");
const router = express.Router();
const { getDiamondsData, getDiamondsCount, updateDaimondsData, deleteDaimond, addDiamond, bulkUpdateDiamonds, holdDiamond, releaseHold, getHeldDiamonds } = require("../../controller/daimond/getDaimondsData");

router.get("/", getDiamondsData);
router.get("/count", getDiamondsCount);
router.get("/held", getHeldDiamonds);
router.post("/", addDiamond);
router.put("/bulk-update", bulkUpdateDiamonds);
router.put("/hold/:id", holdDiamond);
router.put("/release-hold/:id", releaseHold);
router.put("/:id", updateDaimondsData);
router.delete("/:id", deleteDaimond);

module.exports = router;