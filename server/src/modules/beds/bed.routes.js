const express = require("express");

const {
    addBed,
    listBeds,
    listAvailableBeds,
    fetchBedById,
    editBed,
} = require("./bed.controller");

const router = express.Router();

router.post("/", addBed);
router.get("/", listBeds);
router.get("/available", listAvailableBeds);
router.get("/:id", fetchBedById);
router.patch("/:id", editBed);

module.exports = router;
