
const prisma = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function createUser({ name, email, password, role = "RECEPTIONIST" }) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const error = new Error("Email is already registered.");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });

    return user;
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.isActive) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
        {
            sub: String(user.id),
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}

async function createStaff({ name, email, password, role }) {
    const allowedRoles = [
        "RECEPTIONIST",
        "DOCTOR",
        "NURSE",
    ];

    if (!allowedRoles.includes(role)) {
        const error = new Error("Invalid staff role.");
        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        },
    });
}

module.exports = {
    createUser,
    loginUser,
    createStaff
};
