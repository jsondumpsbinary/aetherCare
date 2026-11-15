
require("dotenv").config();

const prisma = require("../src/config/db");
const bcrypt = require("bcrypt");

async function bootstrapAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Admin environment variables are required.");
    }

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error("Admin password must be at least 12 characters.");
    }

    const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
    });

    if (existingAdmin) {
        throw new Error("An administrator already exists. Bootstrap denied.");
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await prisma.user.create({
        data: {
            name: ADMIN_NAME.trim(),
            email: ADMIN_EMAIL.trim().toLowerCase(),
            passwordHash,
            role: "ADMIN",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    console.log("Administrator created:", admin);
}

bootstrapAdmin()
    .catch((error) => {
        console.error("Admin bootstrap failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
