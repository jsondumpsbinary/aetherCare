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
    }, {
        isolationLevel: "Serializable",
    });
}

async function getAdmissions({ patientId, status } = {}) {
    const where = {};

    if (patientId) {
        where.patientId = Number(patientId);
    }

    if (status) {
        where.status = status;
    }

    return await prisma.admission.findMany({
        where,
        include: {
            patient: true,
            bed: {
                include: {
                    ward: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

async function getActiveAdmissions({ patientId } = {}) {
    return await getAdmissions({ patientId, status: "ADMITTED" });
}

async function getAdmissionById(id) {
    return await prisma.admission.findUnique({
        where: { id: Number(id) },
        include: {
            patient: true,
            bed: {
                include: {
                    ward: true,
                },
            },
        },
    });
}

async function updateAdmission(id, data) {
    return await prisma.$transaction(async (tx) => {
        const admissionId = Number(id);
        const existing = await tx.admission.findUnique({
            where: { id: admissionId },
        });

        if (!existing) {
            return { notFound: true };
        }

        if (data.status === "DISCHARGED") {
            return {
                invalidTransition: true,
                message: "Please use the discharge endpoint (/api/admissions/:id/discharge) to discharge a patient.",
            };
        }

        if (data.status === "ADMITTED" && existing.status !== "ADMITTED") {
            return {
                invalidTransition: true,
                message: "A non-active admission cannot be reactivated.",
            };
        }

        if (data.status === "CANCELLED") {
            if (existing.status !== "ADMITTED") {
                return {
                    invalidTransition: true,
                    message: "Only active admissions can be cancelled.",
                };
            }

            const otherActiveAdmission = await tx.admission.findFirst({
                where: {
                    bedId: existing.bedId,
                    status: "ADMITTED",
                    id: { not: admissionId },
                },
            });

            const updateResult = await tx.admission.updateMany({
                where: {
                    id: admissionId,
                    status: "ADMITTED",
                },
                data,
            });

            if (updateResult.count === 0) {
                return {
                    invalidTransition: true,
                    message: "Only active admissions can be cancelled.",
                };
            }

            if (otherActiveAdmission) {
                await tx.bed.updateMany({
                    where: {
                        id: existing.bedId,
                        status: { not: "OCCUPIED" },
                    },
                    data: {
                        status: "OCCUPIED",
                    },
                });
            } else {
                await tx.bed.updateMany({
                    where: {
                        id: existing.bedId,
                        status: "OCCUPIED",
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            }

            const updated = await tx.admission.findUnique({
                where: { id: admissionId },
                include: {
                    patient: true,
                    bed: {
                        include: {
                            ward: true,
                        },
                    },
                },
            });

            return { admission: updated };
        }

        const updated = await tx.admission.update({
            where: { id: admissionId },
            data,
            include: {
                patient: true,
                bed: {
                    include: {
                        ward: true,
                    },
                },
            },
        });

        return { admission: updated };
    }, {
        isolationLevel: "Serializable",
    });
}

async function dischargeAdmission(id) {
    return await prisma.$transaction(async (tx) => {
        const admissionId = Number(id);
        const admission = await tx.admission.findUnique({
            where: { id: admissionId },
            include: {
                bed: true,
                patient: true,
            },
        });

        if (!admission) {
            return {
                error: "ADMISSION_NOT_FOUND",
                status: 404,
                message: "Admission not found.",
            };
        }

        if (admission.status !== "ADMITTED") {
            return {
                error: "INVALID_DISCHARGE_STATUS",
                status: 400,
                message: `Cannot discharge admission with status '${admission.status}'. Only active admissions can be discharged.`,
            };
        }

        const otherActiveAdmission = await tx.admission.findFirst({
            where: {
                bedId: admission.bedId,
                status: "ADMITTED",
                id: { not: admissionId },
            },
        });

        const dischargeDate = new Date();

        const updateResult = await tx.admission.updateMany({
            where: {
                id: admissionId,
                status: "ADMITTED",
            },
            data: {
                status: "DISCHARGED",
                dischargeDate,
            },
        });

        if (updateResult.count === 0) {
            return {
                error: "INVALID_DISCHARGE_STATUS",
                status: 400,
                message: "Only active admissions can be discharged.",
            };
        }

        if (otherActiveAdmission) {
            await tx.bed.updateMany({
                where: {
                    id: admission.bedId,
                    status: { not: "OCCUPIED" },
                },
                data: {
                    status: "OCCUPIED",
                },
            });
        } else {
            await tx.bed.updateMany({
                where: {
                    id: admission.bedId,
                    status: "OCCUPIED",
                },
                data: {
                    status: "AVAILABLE",
                },
            });
        }

        const updatedAdmission = await tx.admission.findUnique({
            where: { id: admissionId },
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
            admission: updatedAdmission,
        };
    }, {
        isolationLevel: "Serializable",
    });
}

module.exports = {
    createAdmission,
    getAdmissions,
    getActiveAdmissions,
    getAdmissionById,
    updateAdmission,
    dischargeAdmission,
};
