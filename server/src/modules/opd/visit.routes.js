const express = require("express");

const {
    addOPDVisit,
    listOPDVisits,
    updateStatus,
} = require("./visit.controller");

const router = express.Router();

router.post("/", addOPDVisit);
router.get("/", listOPDVisits);
router.patch("/:id/status", updateStatus);

module.exports = router;
