const express = require("express");

const { addDoctor,listDoctors } = require("./doctor.controller");

const router = express.Router();

router.post("/", addDoctor);
router.get("/", listDoctors);

module.exports = router;