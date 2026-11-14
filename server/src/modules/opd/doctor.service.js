const { get } = require("node:http");
const prisma = require("../../config/db");

async function createDoctor(name, departmentId) {
    return await prisma.doctor.create({
        data: {
            name,
            departmentId: Number(departmentId),
        },
        include: {
            department: true,
        },
    });
}
async function getDoctors(departmentId) {
    return await prisma.doctor.findMany({
        where: departmentId
            ? {
                departmentId: Number(departmentId),
            }
            : undefined,
        include: {
            department: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

module.exports = {
    createDoctor,
    getDoctors
};