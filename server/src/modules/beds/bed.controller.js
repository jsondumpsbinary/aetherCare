const {
    VALID_BED_TYPES,
    VALID_BED_STATUSES,
    createBed,
    getBeds,
    getAvailableBeds,
    getBedById,
    updateBed,
} = require("./bed.service");

async function addBed(req, res) {
    try {
        const { bedNumber, bedType, status, wardId } = req.body;

        if (!bedNumber || typeof bedNumber !== "string" || !bedNumber.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bed number is required and must be a non-empty string.",
            });
        }

        if (wardId === undefined || wardId === null || !Number.isInteger(Number(wardId)) || Number(wardId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid ward ID is required.",
            });
        }

        if (bedType !== undefined && !VALID_BED_TYPES.includes(bedType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bed type. Allowed types: ${VALID_BED_TYPES.join(", ")}.`,
            });
        }

        if (status !== undefined && !VALID_BED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bed status. Allowed statuses: ${VALID_BED_STATUSES.join(", ")}.`,
            });
        }

        if (status === "OCCUPIED") {
            return res.status(400).json({
                success: false,
                message: "Beds can only become occupied through patient admission.",
            });
        }

        const result = await createBed({
            bedNumber: bedNumber.trim(),
            bedType: bedType || "GENERAL",
            status: status || "AVAILABLE",
            wardId: Number(wardId),
        });

        if (result.wardNotFound) {
            return res.status(404).json({
                success: false,
                message: "Ward not found.",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Bed created successfully.",
            data: result.bed,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A bed with this number already exists.",
            });
        }

        console.error("Bed creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create bed.",
        });
    }
}

async function listBeds(req, res) {
    try {
        const { wardId, status, bedType } = req.query;

        if (wardId && (!Number.isInteger(Number(wardId)) || Number(wardId) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ward ID in query parameter.",
            });
        }

        if (status && !VALID_BED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status filter. Allowed: ${VALID_BED_STATUSES.join(", ")}.`,
            });
        }

        if (bedType && !VALID_BED_TYPES.includes(bedType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bedType filter. Allowed: ${VALID_BED_TYPES.join(", ")}.`,
            });
        }

        const beds = await getBeds({
            wardId: wardId ? Number(wardId) : undefined,
            status,
            bedType,
        });

        return res.status(200).json({
            success: true,
            count: beds.length,
            data: beds,
        });
    } catch (error) {
        console.error("Fetching beds error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch beds.",
        });
    }
}

async function listAvailableBeds(req, res) {
    try {
        const { wardId, bedType } = req.query;

        if (wardId && (!Number.isInteger(Number(wardId)) || Number(wardId) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ward ID in query parameter.",
            });
        }

        if (bedType && !VALID_BED_TYPES.includes(bedType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bedType filter. Allowed: ${VALID_BED_TYPES.join(", ")}.`,
            });
        }

        const beds = await getAvailableBeds({
            wardId: wardId ? Number(wardId) : undefined,
            bedType,
        });

        return res.status(200).json({
            success: true,
            count: beds.length,
            data: beds,
        });
    } catch (error) {
        console.error("Fetching available beds error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch available beds.",
        });
    }
}

async function fetchBedById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID.",
            });
        }

        const bed = await getBedById(id);

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: bed,
        });
    } catch (error) {
        console.error("Fetching bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch bed.",
        });
    }
}

async function editBed(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID.",
            });
        }

        const allowedFields = ["bedNumber", "bedType", "status", "wardId"];
        const data = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                data[field] = req.body[field];
            }
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update.",
            });
        }

        if (data.bedNumber !== undefined) {
            if (typeof data.bedNumber !== "string" || !data.bedNumber.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Bed number cannot be empty.",
                });
            }
            data.bedNumber = data.bedNumber.trim();
        }

        if (data.bedType !== undefined && !VALID_BED_TYPES.includes(data.bedType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bed type. Allowed: ${VALID_BED_TYPES.join(", ")}.`,
            });
        }

        if (data.status !== undefined && !VALID_BED_STATUSES.includes(data.status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid bed status. Allowed: ${VALID_BED_STATUSES.join(", ")}.`,
            });
        }

        if (data.wardId !== undefined) {
            if (!Number.isInteger(Number(data.wardId)) || Number(data.wardId) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ward ID.",
                });
            }
            data.wardId = Number(data.wardId);
        }

        const result = await updateBed(id, data);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        if (result.cannotMarkAvailable) {
            return res.status(400).json({
                success: false,
                message: "Occupied beds cannot be manually marked available. Discharge the patient to release the bed.",
            });
        }

        if (result.statusManagedByAdmission) {
            return res.status(400).json({
                success: false,
                message: "Bed status must be managed through patient admission and discharge.",
            });
        }

        if (result.statusConflict) {
            return res.status(409).json({
                success: false,
                message: "Bed status changed concurrently. Please retry.",
            });
        }

        if (result.wardNotFound) {
            return res.status(404).json({
                success: false,
                message: "Ward not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bed updated successfully.",
            data: result.bed,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A bed with this number already exists.",
            });
        }

        console.error("Updating bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update bed.",
        });
    }
}

module.exports = {
    addBed,
    listBeds,
    listAvailableBeds,
    fetchBedById,
    editBed,
};
