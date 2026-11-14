
const express = require("express");

const {
    createPatient,
    listPatients,
    fetchPatientById,
    editPatient
} = require("./patient.controller");

const router = express.Router();

router.post("/", createPatient);
router.get("/", listPatients);
router.get("/:id", fetchPatientById);
router.patch("/:id", editPatient);

module.exports = router;
