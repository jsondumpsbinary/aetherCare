
const {
    registerPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("./patient.service");

async function createPatient(req, res) {
    try {
        const { name, phone, dateOfBirth, gender, address } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required.",
            });
        }

        if (typeof name !== "string" || typeof phone !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name and phone must be strings.",
            });
        }

        if (dateOfBirth && Number.isNaN(Date.parse(dateOfBirth))) {
            return res.status(400).json({
                success: false,
                message: "Invalid date of birth.",
            });
        }

        const patient = await registerPatient({
            name: name.trim(),
            phone: phone.trim(),
            dateOfBirth,
            gender,
            address,
        });

        return res.status(201).json({
            success: true,
            message: "Patient registered successfully.",
            data: patient,
        });

    } catch (error) {
        console.error("Patient registration error:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A record with this unique value already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}

async function listPatients(req, res) {
    try {
        const search = req.query.search?.trim();

        const patients = await getPatients(search);

        return res.status(200).json({
            success: true,
            count: patients.length,
            data: patients,
        });

    } catch (error) {
        console.error("Fetching patients error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch patients.",
        });
    }
}


async function fetchPatientById(req, res) {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID.",
            });
        }

        const patient = await getPatientById(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: patient,
        });

    } catch (error) {
        console.error("Fetching patient error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch patient.",
        });
    }
}

async function editPatient(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID.",
            });
        }

        const allowedFields = [
            "name",
            "phone",
            "dateOfBirth",
            "gender",
            "address",
        ];

        const data = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                data[field] = req.body[field];
            }
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update.",
            });
        }

        if (data.name !== undefined && !data.name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        if (data.phone !== undefined && !data.phone.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone cannot be empty.",
            });
        }

        if (data.dateOfBirth !== undefined) {
            const date = new Date(data.dateOfBirth);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date of birth.",
                });
            }

            data.dateOfBirth = date;
        }

        const patient = await updatePatient(id, data);

        return res.status(200).json({
            success: true,
            message: "Patient updated successfully.",
            data: patient,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        console.error("Updating patient error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update patient.",
        });
    }
}
async function removePatient(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID.",
            });
        }

        const result = await deletePatient(id);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        if (result.hasVisits) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a patient with existing OPD visits.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient deleted successfully.",
        });
    } catch (error) {
        console.error("Deleting patient error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete patient.",
        });
    }
}

module.exports = {
    createPatient,
    listPatients,
    fetchPatientById,
    editPatient,
    removePatient
};
