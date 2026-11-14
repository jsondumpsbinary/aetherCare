const express = require("express");

const {
    addWard,
    listWards,
} = require("./ward.controller");

const router = express.Router();

router.post("/", addWard);
router.get("/", listWards);

module.exports = router;
