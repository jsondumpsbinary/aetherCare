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

module.exports = {
    createOPDVisit,
};
