const { createOPDVisit } = require("./visit.service");

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

module.exports = {
    addOPDVisit,
};