
const {
    createUser,
    loginUser,
    createStaff,
} = require("./auth.service");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }

        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid input types.",
            });
        }

        if (name.trim().length < 2 || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Name must have at least 2 characters and password at least 8 characters.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const user = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to create account.",
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email and password are required.",
            });
        }

        const result = await loginUser({
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to login.",
        });
    }
}
function getProfile(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            id: req.user.id,
            role: req.user.role,
        },
    });
}
async function addStaff(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof role !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "All staff fields are required.",
            });
        }

        if (name.trim().length < 2 || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Invalid name or password length.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address.",
            });
        }

        const user = await createStaff({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
        });

        return res.status(201).json({
            success: true,
            message: "Staff account created.",
            data: user,
        });
    } catch (error) {
        return res.status(error.code === "P2002" ? 409 : error.statusCode || 500).json({
            success: false,
            message: error.code === "P2002"
                ? "Email already exists."
                : error.statusCode
                    ? error.message
                    : "Unable to create staff account.",
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    addStaff,
};
