const express = require("express");

const {
    createMedicine,
    listMedicines,
    fetchMedicineById,
    editMedicine,
} = require("./inventory.controller");

const router = express.Router();

router.post("/medicines", createMedicine);
router.get("/medicines", listMedicines);
router.get("/medicines/:id", fetchMedicineById);
router.patch("/medicines/:id", editMedicine);

module.exports = router;
