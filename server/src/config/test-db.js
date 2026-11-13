const prisma = require("./db");

async function testConnection() {
    try {
        const result = await prisma.$queryRaw`SELECT current_database()`;

        console.log("Database connected successfully!");
        console.log(result);
    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();