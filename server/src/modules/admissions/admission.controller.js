const {
    createAdmission,
    getAdmissions,
    getActiveAdmissions,
    getAdmissionById,
    updateAdmission,
    dischargeAdmission,
} = require("./admission.service");

async function admitPatient(req, res) {
    try {
        const { patientId, bedId, reason } = req.body;

        if (patientId === undefined || patientId === null || !Number.isInteger(Number(patientId)) || Number(patientId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid patient ID is required.",
            });
        }

        if (bedId === undefined || bedId === null || !Number.isInteger(Number(bedId)) || Number(bedId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid bed ID is required.",
            });
        }

        if (reason !== undefined && typeof reason !== "string") {
            return res.status(400).json({
                success: false,
                message: "Reason must be a string.",
            });
        }

        const result = await createAdmission({
            patientId: Number(patientId),
            bedId: Number(bedId),
            reason,
        });

        if (result.error) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Patient admitted successfully.",
            data: result.admission,
        });
    } catch (error) {
        if (error.code === "P2034") {
            return res.status(409).json({
                success: false,
                message: "Admission changed concurrently. Please retry.",
            });
        }

        console.error("Admission creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create admission.",
        });
    }
}

async function listAdmissions(req, res) {
    try {
        const { patientId, status } = req.query;

        if (patientId && (!Number.isInteger(Number(patientId)) || Number(patientId) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID in query parameter.",
            });
        }

        const admissions = await getAdmissions({
            patientId: patientId ? Number(patientId) : undefined,
            status,
        });

        return res.status(200).json({
            success: true,
            count: admissions.length,
            data: admissions,
        });
    } catch (error) {
        console.error("Fetching admissions error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch admissions.",
        });
    }
}

async function listActiveAdmissions(req, res) {
    try {
        const { patientId } = req.query;

        if (patientId && (!Number.isInteger(Number(patientId)) || Number(patientId) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID in query parameter.",
            });
        }

        const admissions = await getActiveAdmissions({
            patientId: patientId ? Number(patientId) : undefined,
        });

        return res.status(200).json({
            success: true,
            count: admissions.length,
            data: admissions,
        });
    } catch (error) {
        console.error("Fetching active admissions error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch active admissions.",
        });
    }
}

async function fetchAdmissionById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID.",
            });
        }

        const admission = await getAdmissionById(id);

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: "Admission not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: admission,
        });
    } catch (error) {
        console.error("Fetching admission error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch admission.",
        });
    }
}

async function editAdmission(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID.",
            });
        }

        const allowedFields = ["reason", "status"];
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

        if (data.reason !== undefined && typeof data.reason !== "string") {
            return res.status(400).json({
                success: false,
                message: "Reason must be a string.",
            });
        }

        if (
            data.status !== undefined &&
            !["ADMITTED", "DISCHARGED", "CANCELLED"].includes(data.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission status.",
            });
        }

        const result = await updateAdmission(id, data);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Admission not found.",
            });
        }

        if (result.invalidTransition) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admission updated successfully.",
            data: result.admission,
        });
    } catch (error) {
        if (error.code === "P2034") {
            return res.status(409).json({
                success: false,
                message: "Admission changed concurrently. Please retry.",
            });
        }

        console.error("Updating admission error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update admission.",
        });
    }
}

async function dischargePatient(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID.",
            });
        }

        const result = await dischargeAdmission(id);

        if (result.error) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient discharged successfully.",
            data: result.admission,
        });
    } catch (error) {
        if (error.code === "P2034") {
            return res.status(409).json({
                success: false,
                message: "Admission changed concurrently. Please retry.",
            });
        }

        console.error("Discharging patient error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to discharge patient.",
        });
    }
}

module.exports = {
    admitPatient,
    listAdmissions,
    listActiveAdmissions,
    fetchAdmissionById,
    editAdmission,
    dischargePatient,
};
