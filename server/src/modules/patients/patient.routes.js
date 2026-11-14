
const express = require("express");

const {
    createPatient,
    listPatients,
    fetchPatientById
} = require("./patient.controller");

const router = express.Router();

router.post("/", createPatient);
router.get("/", listPatients);
router.get("/:id", fetchPatientById);

module.exports = router;
