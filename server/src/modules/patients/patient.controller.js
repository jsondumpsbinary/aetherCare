
const { registerPatient,getPatients } = require("./patient.service");

async function createPatient(req, res) {
    try {
        const { name, phone, dateOfBirth, gender, address } = req.body;

        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required.",
            });
        }

        // Validate field types
        if (typeof name !== "string" || typeof phone !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name and phone must be strings.",
            });
        }

        // Validate date of birth if provided
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

        // Handle unique constraint violations
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



module.exports = {
    createPatient,
    listPatients
};
