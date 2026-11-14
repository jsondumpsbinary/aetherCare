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
    const existingBed = await prisma.bed.findUnique({
        where: { id: Number(id) },
    });

    if (!existingBed) {
        return { notFound: true };
    }

    if (data.status === "AVAILABLE" && existingBed.status === "OCCUPIED") {
        return { cannotMarkAvailable: true };
    }

    if (data.wardId !== undefined) {
        const ward = await prisma.ward.findUnique({
            where: { id: Number(data.wardId) },
        });

        if (!ward) {
            return { wardNotFound: true };
        }
    }

    const updatedBed = await prisma.bed.update({
        where: { id: Number(id) },
        data,
        include: {
            ward: true,
        },
    });

    return { bed: updatedBed };
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
