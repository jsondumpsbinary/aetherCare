
const express = require("express");

const {
    createPatient,
    listPatients,
} = require("./patient.controller");

const router = express.Router();

router.post("/", createPatient);
router.get("/", listPatients);

module.exports = router;
