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

module.exports = {
    createDoctor,
};