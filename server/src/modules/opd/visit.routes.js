const express = require("express");

const { addOPDVisit } = require("./visit.controller");

const router = express.Router();

router.post("/", addOPDVisit);

module.exports = router;