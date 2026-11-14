const {
    addMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
} = require("./inventory.service");

async function createMedicine(req, res) {
    try {
        const {
            name,
            genericName,
            category,
            batchNumber,
            expiryDate,
            currentStock,
            lowStockThreshold,
            unit,
            unitPrice,
        } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Medicine name is required and must be a string.",
            });
        }

        if (!batchNumber || typeof batchNumber !== "string" || !batchNumber.trim()) {
            return res.status(400).json({
                success: false,
                message: "Batch number is required and must be a string.",
            });
        }

        if (currentStock !== undefined && (!Number.isInteger(Number(currentStock)) || Number(currentStock) < 0)) {
            return res.status(400).json({
                success: false,
                message: "Current stock must be a non-negative integer.",
            });
        }

        if (lowStockThreshold !== undefined && (!Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0)) {
            return res.status(400).json({
                success: false,
                message: "Low-stock threshold must be a non-negative integer.",
            });
        }

        if (expiryDate && Number.isNaN(Date.parse(expiryDate))) {
            return res.status(400).json({
                success: false,
                message: "Invalid expiry date format.",
            });
        }

        if (unitPrice !== undefined && (typeof unitPrice !== "number" || unitPrice < 0)) {
            return res.status(400).json({
                success: false,
                message: "Unit price must be a non-negative number.",
            });
        }

        const medicine = await addMedicine({
            name,
            genericName,
            category,
            batchNumber,
            expiryDate,
            currentStock,
            lowStockThreshold,
            unit,
            unitPrice,
        });

        return res.status(201).json({
            success: true,
            message: "Medicine added to inventory successfully.",
            data: medicine,
        });
    } catch (error) {
        console.error("Error creating medicine:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating medicine.",
        });
    }
}

async function listMedicines(req, res) {
    try {
        const { search, category, lowStock, limit, offset } = req.query;

        const medicines = await getMedicines({
            search,
            category,
            lowStock,
            limit,
            offset,
        });

        return res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines,
        });
    } catch (error) {
        console.error("Error listing medicines:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching medicines.",
        });
    }
}

async function fetchMedicineById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid medicine ID.",
            });
        }

        const medicine = await getMedicineById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        console.error("Error fetching medicine by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching medicine.",
        });
    }
}

async function editMedicine(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid medicine ID.",
            });
        }

        const result = await updateMedicine(id, req.body);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Medicine updated successfully.",
            data: result.medicine,
        });
    } catch (error) {
        console.error("Error updating medicine:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating medicine.",
        });
    }
}

module.exports = {
    createMedicine,
    listMedicines,
    fetchMedicineById,
    editMedicine,
};
