const express = require("express");

const {
    addDepartment,
    listDepartments
} = require("./department.controller");

const router = express.Router();

router.post("/", addDepartment);
router.get("/", listDepartments);

module.exports = router;