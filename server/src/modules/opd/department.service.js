const prisma = require("../../config/db");

async function createDepartment(name) {
    return await prisma.department.create({
        data: {
            name,
        },
    });
}

async function getDepartments() {
    return await prisma.department.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

module.exports = {
    createDepartment,
    getDepartments,
};