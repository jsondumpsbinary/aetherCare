const {
    createDepartment,
    getDepartments,
} = require("./department.service");

async function addDepartment(req, res) {
    try {
        const { name } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required.",
            });
        }

        const department = await createDepartment(name.trim());

        return res.status(201).json({
            success: true,
            message: "Department created successfully.",
            data: department,
        });

    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Department already exists.",
            });
        }

        console.error("Department creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create department.",
        });
    }
}

async function listDepartments(req, res) {
    try {
        const departments = await getDepartments();

        return res.status(200).json({
            success: true,
            count: departments.length,
            data: departments,
        });
    } catch (error) {
        console.error("Fetching departments error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch departments.",
        });
    }
}

module.exports = {
    addDepartment,
    listDepartments
};