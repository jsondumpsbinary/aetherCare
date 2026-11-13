const express = require("express");
const { createPatient } = require("./patient.controller");

const router = express.Router();

router.post("/", createPatient);

module.exports = router;
