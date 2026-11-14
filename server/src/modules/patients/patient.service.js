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


module.exports = {
  registerPatient,
  getPatients
};
