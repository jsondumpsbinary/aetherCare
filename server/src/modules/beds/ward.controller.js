const {
    createWard,
    getWards,
} = require("./ward.service");

async function addWard(req, res) {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Ward name is required.",
            });
        }

        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "Description must be a string.",
            });
        }

        const ward = await createWard({
            name: name.trim(),
            description: description && description.trim() ? description.trim() : null,
        });

        return res.status(201).json({
            success: true,
            message: "Ward created successfully.",
            data: ward,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A ward with this name already exists.",
            });
        }

        console.error("Ward creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create ward.",
        });
    }
}

async function listWards(req, res) {
    try {
        const wards = await getWards();

        return res.status(200).json({
            success: true,
            count: wards.length,
            data: wards,
        });
    } catch (error) {
        console.error("Fetching wards error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch wards.",
        });
    }
}

module.exports = {
    addWard,
    listWards,
};
