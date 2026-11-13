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

module.exports = {
  registerPatient,
};
