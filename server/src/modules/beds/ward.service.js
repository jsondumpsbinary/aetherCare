const prisma = require("../../config/db");

async function createWard(data) {
    return await prisma.ward.create({
        data,
    });
}

async function getWards() {
    return await prisma.ward.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            _count: {
                select: {
                    beds: true,
                },
            },
        },
    });
}

async function getWardById(id) {
    return await prisma.ward.findUnique({
        where: { id: Number(id) },
    });
}

module.exports = {
    createWard,
    getWards,
    getWardById,
};
