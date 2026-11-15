const prisma = require("../../config/db");

const VALID_BED_TYPES = ["GENERAL", "ICU", "PRIVATE"];
const VALID_BED_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];

async function createBed({ bedNumber, bedType = "GENERAL", status = "AVAILABLE", wardId }) {
    const ward = await prisma.ward.findUnique({
        where: { id: Number(wardId) },
    });

    if (!ward) {
        return { wardNotFound: true };
    }

    const bed = await prisma.bed.create({
        data: {
            bedNumber,
            bedType,
            status,
            wardId: Number(wardId),
        },
        include: {
            ward: true,
        },
    });

    return { bed };
}

async function getBeds({ wardId, status, bedType } = {}) {
    const where = {};

    if (wardId) {
        where.wardId = Number(wardId);
    }

    if (status) {
        where.status = status;
    }

    if (bedType) {
        where.bedType = bedType;
    }

    return await prisma.bed.findMany({
        where,
        include: {
            ward: true,
        },
        orderBy: {
            bedNumber: "asc",
        },
    });
}

async function getAvailableBeds({ wardId, bedType } = {}) {
    return await getBeds({ wardId, status: "AVAILABLE", bedType });
}

async function getBedById(id) {
    return await prisma.bed.findUnique({
        where: { id: Number(id) },
        include: {
            ward: true,
        },
    });
}

async function updateBed(id, data) {
    return await prisma.$transaction(async (tx) => {
        const bedId = Number(id);
        const existingBed = await tx.bed.findUnique({
            where: { id: bedId },
        });

        if (!existingBed) {
            return { notFound: true };
        }

        const updateData = { ...data };

        if (updateData.wardId !== undefined) {
            const ward = await tx.ward.findUnique({
                where: { id: Number(updateData.wardId) },
            });

            if (!ward) {
                return { wardNotFound: true };
            }
        }

        if (updateData.status !== undefined) {
            if (updateData.status === "OCCUPIED") {
                return { statusManagedByAdmission: true };
            }

            if (existingBed.status === "OCCUPIED") {
                if (updateData.status === "AVAILABLE") {
                    return { cannotMarkAvailable: true };
                }

                return { statusManagedByAdmission: true };
            }

            const activeAdmission = await tx.admission.findFirst({
                where: {
                    bedId,
                    status: "ADMITTED",
                },
            });

            if (activeAdmission) {
                return { statusManagedByAdmission: true };
            }

            if (updateData.status !== existingBed.status) {
                const statusUpdate = await tx.bed.updateMany({
                    where: {
                        id: bedId,
                        status: existingBed.status,
                    },
                    data: {
                        status: updateData.status,
                    },
                });

                if (statusUpdate.count === 0) {
                    return { statusConflict: true };
                }
            }

            delete updateData.status;
        }

        const bed = Object.keys(updateData).length > 0
            ? await tx.bed.update({
                where: { id: bedId },
                data: updateData,
                include: { ward: true },
            })
            : await tx.bed.findUnique({
                where: { id: bedId },
                include: { ward: true },
            });

        return { bed };
    });
}

module.exports = {
    VALID_BED_TYPES,
    VALID_BED_STATUSES,
    createBed,
    getBeds,
    getAvailableBeds,
    getBedById,
    updateBed,
};
