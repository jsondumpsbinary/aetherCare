const {
    createAdmission,
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
        console.error("Admission creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create admission.",
        });
    }
}

module.exports = {
    admitPatient,
};
