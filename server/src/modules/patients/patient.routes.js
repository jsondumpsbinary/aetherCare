
const express = require("express");

const {
    createPatient,
    listPatients,
    fetchPatientById,
    editPatient,
    removePatient
} = require("./patient.controller");

const router = express.Router();

router.post("/", createPatient);
router.get("/", listPatients);
router.get("/:id", fetchPatientById);
router.patch("/:id", editPatient);
router.delete("/:id", removePatient);

module.exports = router;
