const express = require("express");

const {
    createMedicine,
    listMedicines,
    fetchMedicineById,
    editMedicine,
    restock,
    issue,
    adjust,
    getLowStock,
    listMovements,
} = require("./inventory.controller");

const router = express.Router();

// Static routes first to avoid being shadowed by :id
router.get("/medicines/low-stock", getLowStock);
router.get("/low-stock", getLowStock);
router.get("/movements", listMovements);

// Medicine catalogue routes
router.post("/medicines", createMedicine);
router.get("/medicines", listMedicines);
router.get("/medicines/:id", fetchMedicineById);
router.patch("/medicines/:id", editMedicine);

// Stock operation routes
router.post("/medicines/:id/restock", restock);
router.post("/medicines/:id/issue", issue);
router.post("/medicines/:id/adjust", adjust);

module.exports = router;

