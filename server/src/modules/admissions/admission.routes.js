const express = require("express");

const {
    admitPatient,
} = require("./admission.controller");

const router = express.Router();

router.post("/", admitPatient);

module.exports = router;
