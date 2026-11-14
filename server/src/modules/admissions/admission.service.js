const prisma = require("../../config/db");

async function createAdmission({ patientId, bedId, reason }) {
    return await prisma.$transaction(async (tx) => {
        // 1. Check whether patient exists
        const patient = await tx.patient.findUnique({
            where: { id: Number(patientId) },
        });

        if (!patient) {
            return {
                error: "PATIENT_NOT_FOUND",
                status: 404,
                message: "Patient not found.",
            };
        }

        // 2. Check whether patient already has an active admission
        const activePatientAdmission = await tx.admission.findFirst({
            where: {
                patientId: Number(patientId),
                status: "ADMITTED",
            },
        });

        if (activePatientAdmission) {
            return {
                error: "PATIENT_ALREADY_ADMITTED",
                status: 409,
                message: "Patient already has an active admission.",
            };
        }

        // 3. Check whether bed exists
        const bed = await tx.bed.findUnique({
            where: { id: Number(bedId) },
        });

        if (!bed) {
            return {
                error: "BED_NOT_FOUND",
                status: 404,
                message: "Bed not found.",
            };
        }

        // 4. Reject maintenance beds
        if (bed.status === "MAINTENANCE") {
            return {
                error: "BED_UNDER_MAINTENANCE",
                status: 400,
                message: "Cannot assign a bed that is under maintenance.",
            };
        }

        // 5. Concurrency protection: Atomic conditional update
        const updateResult = await tx.bed.updateMany({
            where: {
                id: Number(bedId),
                status: "AVAILABLE",
            },
            data: {
                status: "OCCUPIED",
            },
        });

        if (updateResult.count === 0) {
            return {
                error: "BED_UNAVAILABLE",
                status: 409,
                message: "Bed is not available or has already been assigned.",
            };
        }

        // 6. Create admission record
        const admission = await tx.admission.create({
            data: {
                patientId: Number(patientId),
                bedId: Number(bedId),
                reason: reason && reason.trim() ? reason.trim() : null,
                status: "ADMITTED",
            },
            include: {
                patient: true,
                bed: {
                    include: {
                        ward: true,
                    },
                },
            },
        });

        return {
            success: true,
            admission,
        };
    });
}

module.exports = {
    createAdmission,
};
