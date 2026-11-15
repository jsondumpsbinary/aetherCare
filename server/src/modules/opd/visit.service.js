const prisma = require("../../config/db");

async function createOPDVisit(patientId, doctorId, departmentId) {
    return await prisma.$transaction(
        async (tx) => {
            // Verify patient exists
            const patient = await tx.patient.findUnique({
                where: { id: patientId },
            });

            if (!patient) {
                throw new Error("PATIENT_NOT_FOUND");
            }

            // Verify doctor exists and belongs to department
            const doctor = await tx.doctor.findFirst({
                where: {
                    id: doctorId,
                    departmentId,
                },
            });

            if (!doctor) {
                throw new Error("DOCTOR_DEPARTMENT_MISMATCH");
            }

            // Today's date at midnight
            const now = new Date();

            const visitDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            // Count existing visits for this department today
            const count = await tx.oPDVisit.count({
                where: {
                    departmentId,
                    visitDay,
                },
            });

            const tokenNumber = `OPD-${String(count + 1).padStart(3, "0")}`;

            return await tx.oPDVisit.create({
                data: {
                    patientId,
                    doctorId,
                    departmentId,
                    tokenNumber,
                    visitDay,
                },
                include: {
                    patient: true,
                    doctor: true,
                    department: true,
                },
            });
        },
        {
            isolationLevel: "Serializable",
        }
    );
}

const VALID_OPD_STATUSES = ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED"];

async function getOPDVisits({ departmentId, doctorId, visitDate, status } = {}) {
    const where = {};

    if (departmentId) {
        where.departmentId = Number(departmentId);
    }

    if (doctorId) {
        where.doctorId = Number(doctorId);
    }

    if (status) {
        where.status = status;
    }

    if (visitDate) {
        const date = new Date(visitDate);
        if (!Number.isNaN(date.getTime())) {
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            where.visitDay = startOfDay;
        }
    }

    return await prisma.oPDVisit.findMany({
        where,
        include: {
            patient: true,
            doctor: true,
            department: true,
        },
        orderBy: [
            { visitDate: "asc" },
            { tokenNumber: "asc" },
        ],
    });
}

async function updateOPDVisitStatus(id, newStatus) {
    const visitId = Number(id);

    if (!VALID_OPD_STATUSES.includes(newStatus)) {
        return { invalidStatus: true };
    }

    const existing = await prisma.oPDVisit.findUnique({
        where: { id: visitId },
    });

    if (!existing) {
        return { notFound: true };
    }

    const updated = await prisma.oPDVisit.update({
        where: { id: visitId },
        data: { status: newStatus },
        include: {
            patient: true,
            doctor: true,
            department: true,
        },
    });

    return { visit: updated };
}

module.exports = {
    VALID_OPD_STATUSES,
    createOPDVisit,
    getOPDVisits,
    updateOPDVisitStatus,
};
