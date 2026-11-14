const express = require("express");

const {
    admitPatient,
    listAdmissions,
    listActiveAdmissions,
    fetchAdmissionById,
    editAdmission,
    dischargePatient,
} = require("./admission.controller");

const router = express.Router();

router.post("/", admitPatient);
router.get("/", listAdmissions);
router.get("/active", listActiveAdmissions);
router.get("/:id", fetchAdmissionById);
router.patch("/:id/discharge", dischargePatient);
router.patch("/:id", editAdmission);

module.exports = router;
