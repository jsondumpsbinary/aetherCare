const {
    createOPDVisit,
    getOPDVisits,
    updateOPDVisitStatus,
    VALID_OPD_STATUSES,
} = require("./visit.service");

async function addOPDVisit(req, res) {
    try {
        const { patientId, doctorId, departmentId } = req.body;

        const ids = [patientId, doctorId, departmentId];

        if (
            ids.some(
                (id) =>
                    !Number.isInteger(Number(id)) ||
                    Number(id) <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid patientId, doctorId and departmentId are required.",
            });
        }

        const visit = await createOPDVisit(
            Number(patientId),
            Number(doctorId),
            Number(departmentId)
        );

        return res.status(201).json({
            success: true,
            message: "OPD visit created successfully.",
            data: visit,
        });

    } catch (error) {
        if (error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        if (error.message === "DOCTOR_DEPARTMENT_MISMATCH") {
            return res.status(400).json({
                success: false,
                message: "Doctor does not belong to the selected department.",
            });
        }

        console.error("OPD visit creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create OPD visit.",
        });
    }
}

async function listOPDVisits(req, res) {
    try {
        const { departmentId, doctorId, visitDate, status } = req.query;

        const visits = await getOPDVisits({
            departmentId,
            doctorId,
            visitDate,
            status,
        });

        return res.status(200).json({
            success: true,
            count: visits.length,
            data: visits,
        });
    } catch (error) {
        console.error("Error listing OPD visits:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch OPD visits.",
        });
    }
}

async function updateStatus(req, res) {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid visit ID.",
            });
        }

        if (!status || !VALID_OPD_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${VALID_OPD_STATUSES.join(", ")}.`,
            });
        }

        const result = await updateOPDVisitStatus(id, status);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "OPD visit not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OPD visit status updated successfully.",
            data: result.visit,
        });
    } catch (error) {
        console.error("Error updating OPD visit status:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update OPD visit status.",
        });
    }
}

module.exports = {
    addOPDVisit,
    listOPDVisits,
    updateStatus,
};
