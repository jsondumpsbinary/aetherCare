const prisma = require("../../config/db");

const VALID_MOVEMENT_TYPES = ["RESTOCK", "DISPENSED", "ADJUSTMENT", "DISCARDED"];

async function addMedicine({
    name,
    genericName,
    category,
    batchNumber,
    expiryDate,
    currentStock = 0,
    lowStockThreshold = 10,
    unit = "units",
    unitPrice,
}) {
    return await prisma.$transaction(async (tx) => {
        const stockCount = Number(currentStock) || 0;
        const thresholdCount = Number(lowStockThreshold) || 10;
        const price = unitPrice !== undefined && unitPrice !== null ? Number(unitPrice) : null;
        const parsedExpiry = expiryDate ? new Date(expiryDate) : null;

        const medicine = await tx.medicine.create({
            data: {
                name: name.trim(),
                genericName: genericName ? genericName.trim() : null,
                category: category ? category.trim() : null,
                batchNumber: batchNumber.trim(),
                expiryDate: parsedExpiry,
                currentStock: stockCount,
                lowStockThreshold: thresholdCount,
                unit: unit ? unit.trim() : "units",
                unitPrice: price,
            },
        });

        if (stockCount > 0) {
            await tx.stockMovement.create({
                data: {
                    medicineId: medicine.id,
                    quantity: stockCount,
                    movementType: "RESTOCK",
                    previousStock: 0,
                    newStock: stockCount,
                    reason: "Initial stock on medicine registration",
                },
            });
        }

        return medicine;
    });
}

async function getMedicines({ search, category, lowStock, limit = 50, offset = 0 } = {}) {
    const where = {};

    if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { genericName: { contains: query, mode: "insensitive" } },
            { batchNumber: { contains: query, mode: "insensitive" } },
        ];
    }

    if (category && category.trim()) {
        where.category = { equals: category.trim(), mode: "insensitive" };
    }

    const medicines = await prisma.medicine.findMany({
        where,
        take: Number(limit) || 50,
        skip: Number(offset) || 0,
        orderBy: { name: "asc" },
    });

    if (lowStock === true || lowStock === "true") {
        return medicines.filter((m) => m.currentStock <= m.lowStockThreshold);
    }

    return medicines;
}

async function getMedicineById(id) {
    const medicineId = Number(id);
    return await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: {
            stockMovements: {
                take: 20,
                orderBy: { createdAt: "desc" },
                include: {
                    patient: {
                        select: {
                            id: true,
                            patientCode: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}

async function updateMedicine(id, data) {
    const medicineId = Number(id);

    const existing = await prisma.medicine.findUnique({
        where: { id: medicineId },
    });

    if (!existing) {
        return { notFound: true };
    }

    const updateData = {};
    const allowedFields = [
        "name",
        "genericName",
        "category",
        "batchNumber",
        "expiryDate",
        "lowStockThreshold",
        "unit",
        "unitPrice",
    ];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            if (field === "expiryDate") {
                updateData[field] = data[field] ? new Date(data[field]) : null;
            } else if (field === "lowStockThreshold") {
                updateData[field] = Number(data[field]);
            } else if (field === "unitPrice") {
                updateData[field] = data[field] !== null ? Number(data[field]) : null;
            } else if (typeof data[field] === "string") {
                updateData[field] = data[field].trim();
            } else {
                updateData[field] = data[field];
            }
        }
    }

    const updated = await prisma.medicine.update({
        where: { id: medicineId },
        data: updateData,
    });

    return { medicine: updated };
}

async function restockMedicine(id, { quantity, batchNumber, expiryDate, reason }) {
    const medicineId = Number(id);
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
        return { invalidQuantity: true };
    }

    return await prisma.$transaction(async (tx) => {
        const medicine = await tx.medicine.findUnique({
            where: { id: medicineId },
        });

        if (!medicine) {
            return { notFound: true };
        }

        const previousStock = medicine.currentStock;
        const newStock = previousStock + qty;

        const updateData = {
            currentStock: newStock,
        };

        if (batchNumber && batchNumber.trim()) {
            updateData.batchNumber = batchNumber.trim();
        }

        if (expiryDate) {
            updateData.expiryDate = new Date(expiryDate);
        }

        const updatedMedicine = await tx.medicine.update({
            where: { id: medicineId },
            data: updateData,
        });

        const movement = await tx.stockMovement.create({
            data: {
                medicineId,
                quantity: qty,
                movementType: "RESTOCK",
                previousStock,
                newStock,
                reason: reason ? reason.trim() : "Stock replenishment",
            },
        });

        return {
            success: true,
            medicine: updatedMedicine,
            movement,
        };
    });
}

async function issueMedicine(id, { quantity, patientId, reason }) {
    const medicineId = Number(id);
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
        return { invalidQuantity: true };
    }

    return await prisma.$transaction(async (tx) => {
        const medicine = await tx.medicine.findUnique({
            where: { id: medicineId },
        });

        if (!medicine) {
            return { notFound: true };
        }

        let patientRecord = null;
        if (patientId) {
            patientRecord = await tx.patient.findUnique({
                where: { id: Number(patientId) },
            });

            if (!patientRecord) {
                return { patientNotFound: true };
            }
        }

        if (medicine.currentStock < qty) {
            return {
                insufficientStock: true,
                currentStock: medicine.currentStock,
                requested: qty,
            };
        }

        const updateResult = await tx.medicine.updateMany({
            where: {
                id: medicineId,
                currentStock: { gte: qty },
            },
            data: {
                currentStock: { decrement: qty },
            },
        });

        if (updateResult.count === 0) {
            return {
                insufficientStock: true,
                currentStock: medicine.currentStock,
                requested: qty,
            };
        }

        const previousStock = medicine.currentStock;
        const newStock = previousStock - qty;

        const updatedMedicine = await tx.medicine.findUnique({
            where: { id: medicineId },
        });

        const movement = await tx.stockMovement.create({
            data: {
                medicineId,
                patientId: patientId ? Number(patientId) : null,
                quantity: qty,
                movementType: "DISPENSED",
                previousStock,
                newStock,
                reason: reason ? reason.trim() : "Dispensed for patient treatment",
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        patientCode: true,
                        name: true,
                    },
                },
            },
        });

        return {
            success: true,
            medicine: updatedMedicine,
            movement,
        };
    });
}

async function adjustStock(id, { newStock, reason }) {
    const medicineId = Number(id);
    const targetStock = Number(newStock);

    if (!Number.isInteger(targetStock) || targetStock < 0) {
        return { invalidStock: true };
    }

    return await prisma.$transaction(async (tx) => {
        const medicine = await tx.medicine.findUnique({
            where: { id: medicineId },
        });

        if (!medicine) {
            return { notFound: true };
        }

        const previousStock = medicine.currentStock;
        const diff = targetStock - previousStock;

        const updatedMedicine = await tx.medicine.update({
            where: { id: medicineId },
            data: { currentStock: targetStock },
        });

        const movement = await tx.stockMovement.create({
            data: {
                medicineId,
                quantity: Math.abs(diff),
                movementType: "ADJUSTMENT",
                previousStock,
                newStock: targetStock,
                reason: reason ? reason.trim() : `Manual inventory adjustment (${diff >= 0 ? "+" : ""}${diff})`,
            },
        });

        return {
            success: true,
            medicine: updatedMedicine,
            movement,
        };
    });
}

async function getLowStockMedicines() {
    const medicines = await prisma.$queryRaw`
        SELECT * FROM "Medicine"
        WHERE "currentStock" <= "lowStockThreshold"
        ORDER BY "currentStock" ASC, "name" ASC
    `;

    return medicines;
}

async function getStockMovements({ medicineId, patientId, movementType, limit = 50 } = {}) {
    const where = {};

    if (medicineId) {
        where.medicineId = Number(medicineId);
    }

    if (patientId) {
        where.patientId = Number(patientId);
    }

    if (movementType && VALID_MOVEMENT_TYPES.includes(movementType)) {
        where.movementType = movementType;
    }

    return await prisma.stockMovement.findMany({
        where,
        take: Number(limit) || 50,
        orderBy: { createdAt: "desc" },
        include: {
            medicine: {
                select: {
                    id: true,
                    name: true,
                    batchNumber: true,
                    unit: true,
                },
            },
            patient: {
                select: {
                    id: true,
                    patientCode: true,
                    name: true,
                },
            },
        },
    });
}

module.exports = {
    VALID_MOVEMENT_TYPES,
    addMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    restockMedicine,
    issueMedicine,
    adjustStock,
    getLowStockMedicines,
    getStockMovements,
};

