const express = require("express");

const { addDoctor } = require("./doctor.controller");

const router = express.Router();

router.post("/", addDoctor);

module.exports = router;