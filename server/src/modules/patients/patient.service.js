const crypto = require("node:crypto");
const prisma = require("../../config/db");

async function registerPatient(patientData) {
  const { name, phone, dateOfBirth, gender, address } = patientData;

  // Generate a unique patient registration code.
  const patientCode = `PAT-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  const patient = await prisma.patient.create({
    data: {
      patientCode,
      name,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
    },
  });

  return patient;
}


async function getPatients(search) {
    const patients = await prisma.patient.findMany({
        where: search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        phone: {
                            contains: search,
                        },
                    },
                    {
                        patientCode: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : undefined,

        orderBy: {
            createdAt: "desc",
        },
    });

    return patients;
}


async function getPatientById(id) {
    const patient = await prisma.patient.findUnique({
        where: {
            id: Number(id),
        },
    });

    return patient;
}

async function updatePatient(id, data) {
    return await prisma.patient.update({
        where: {
            id: Number(id),
        },
        data,
    });
}

async function deletePatient(id) {
    const patient = await prisma.patient.findUnique({
        where: { id: Number(id) },
        include: {
            _count: {
                select: {
                    opdVisits: true,
                },
            },
        },
    });

    if (!patient) {
        return { notFound: true };
    }

    if (patient._count.opdVisits > 0) {
        return { hasVisits: true };
    }

    await prisma.patient.delete({
        where: { id: Number(id) },
    });

    return { deleted: true };
}

module.exports = {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
