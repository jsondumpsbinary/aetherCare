const express = require("express");

const {
    createMedicine,
    listMedicines,
    fetchMedicineById,
    editMedicine,
    restock,
    adjust,
} = require("./inventory.controller");

const router = express.Router();

router.post("/medicines", createMedicine);
router.get("/medicines", listMedicines);
router.get("/medicines/:id", fetchMedicineById);
router.patch("/medicines/:id", editMedicine);

// Stock operation routes
router.post("/medicines/:id/restock", restock);
router.post("/medicines/:id/adjust", adjust);

module.exports = router;
