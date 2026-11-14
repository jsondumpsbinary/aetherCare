const {
    createDoctor,
    getDoctors,
} = require("./doctor.service");

async function addDoctor(req, res) {
    try {
        const { name, departmentId } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Doctor name is required.",
            });
        }

        const id = Number(departmentId);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid department ID is required.",
            });
        }

        const doctor = await createDoctor(name.trim(), id);

        return res.status(201).json({
            success: true,
            message: "Doctor created successfully.",
            data: doctor,
        });

    } catch (error) {
        if (error.code === "P2003") {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        console.error("Doctor creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create doctor.",
        });
    }
}

async function listDoctors(req, res) {
    try {
        const { departmentId } = req.query;

        if (
            departmentId !== undefined &&
            (!Number.isInteger(Number(departmentId)) ||
                Number(departmentId) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID.",
            });
        }

        const doctors = await getDoctors(departmentId);

        return res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        console.error("Fetching doctors error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch doctors.",
        });
    }
}

module.exports = {
    addDoctor,
    listDoctors,
};