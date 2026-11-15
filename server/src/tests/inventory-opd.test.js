const assert = require("node:assert");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../app");
const prisma = require("../config/db");

async function runInventoryAndOPDTests() {
    console.log("==================================================");
    console.log("   INVENTORY & OPD QUEUE VERIFICATION TEST SUITE  ");
    console.log("==================================================");

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;

    let passedTests = 0;
    let failedTests = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`✓ [PASS] ${name}`);
            passedTests++;
        } catch (err) {
            console.error(`✗ [FAIL] ${name}`);
            console.error(err);
            failedTests++;
        }
    }

    try {
        let adminUser = await prisma.user.findFirst({
            where: { role: "ADMIN", isActive: true },
        });

        if (!adminUser) {
            const passwordHash = await bcrypt.hash("AdminPassword123!", 10);
            adminUser = await prisma.user.create({
                data: {
                    name: "Test Administrator",
                    email: `admin_${Date.now()}@aethercare.test`,
                    passwordHash,
                    role: "ADMIN",
                },
            });
        }

        const token = jwt.sign(
            { sub: String(adminUser.id), role: adminUser.role },
            process.env.JWT_SECRET || "aethercare-dev-secret-key-at-least-32-chars-long",
            { expiresIn: "1h" }
        );

        const authHeaders = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        let departmentId;
        let doctorId;
        let patientId;
        let visitId;
        let medicineId;

        await test("OPD 1: Setup Department, Doctor and Patient", async () => {
            const dept = await prisma.department.create({
                data: { name: `Cardiology-${Date.now()}` },
            });
            departmentId = dept.id;

            const doc = await prisma.doctor.create({
                data: { name: "Dr. Smith", departmentId },
            });
            doctorId = doc.id;

            const res = await fetch(`${base}/api/patients`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: "Jane Doe",
                    phone: "9876543210",
                }),
            });
            assert.strictEqual(res.status, 201);
            const data = await res.json();
            patientId = data.data.id;
        });

        await test("OPD 2: Create OPD Visit and verify token generation", async () => {
            const res = await fetch(`${base}/api/opd-visits`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId,
                    doctorId,
                    departmentId,
                }),
            });
            assert.strictEqual(res.status, 201);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.data.tokenNumber.startsWith("OPD-"));
            assert.strictEqual(data.data.status, "WAITING");
            visitId = data.data.id;
        });

        await test("OPD 3: List OPD Queue visits with filtering", async () => {
            const res = await fetch(`${base}/api/opd-visits?departmentId=${departmentId}&status=WAITING`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.count >= 1);
            const found = data.data.find((v) => v.id === visitId);
            assert.ok(found);
            assert.strictEqual(found.status, "WAITING");
        });

        await test("OPD 4: Update OPD Visit status to IN_CONSULTATION", async () => {
            const res = await fetch(`${base}/api/opd-visits/${visitId}/status`, {
                method: "PATCH",
                headers: authHeaders,
                body: JSON.stringify({ status: "IN_CONSULTATION" }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "IN_CONSULTATION");
        });

        await test("OPD 5: Update OPD Visit status to COMPLETED", async () => {
            const res = await fetch(`${base}/api/opd-visits/${visitId}/status`, {
                method: "PATCH",
                headers: authHeaders,
                body: JSON.stringify({ status: "COMPLETED" }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "COMPLETED");
        });

        await test("OPD 6: Rejects invalid status transition", async () => {
            const res = await fetch(`${base}/api/opd-visits/${visitId}/status`, {
                method: "PATCH",
                headers: authHeaders,
                body: JSON.stringify({ status: "INVALID_STATUS" }),
            });
            assert.strictEqual(res.status, 400);
        });

        await test("Inventory 1: Add new medicine to catalogue with initial stock", async () => {
            const res = await fetch(`${base}/api/inventory/medicines`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: "Amoxicillin 500mg",
                    genericName: "Amoxicillin",
                    category: "Antibiotics",
                    batchNumber: `BAT-${Date.now()}`,
                    expiryDate: "2027-12-31",
                    currentStock: 25,
                    lowStockThreshold: 10,
                    unit: "capsules",
                    unitPrice: 12.5,
                }),
            });
            assert.strictEqual(res.status, 201);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.currentStock, 25);
            assert.strictEqual(data.data.lowStockThreshold, 10);
            medicineId = data.data.id;
        });

        await test("Inventory 2: List medicines with search filter", async () => {
            const res = await fetch(`${base}/api/inventory/medicines?search=Amoxicillin`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.count >= 1);
            const found = data.data.find((m) => m.id === medicineId);
            assert.ok(found);
        });

        await test("Inventory 3: Fetch medicine details by ID", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.name, "Amoxicillin 500mg");
            assert.ok(Array.isArray(data.data.stockMovements));
            assert.strictEqual(data.data.stockMovements[0].movementType, "RESTOCK");
        });

        await test("Inventory 4: Update medicine details metadata", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}`, {
                method: "PATCH",
                headers: authHeaders,
                body: JSON.stringify({
                    unitPrice: 15.0,
                    lowStockThreshold: 12,
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.unitPrice, 15.0);
            assert.strictEqual(data.data.lowStockThreshold, 12);
        });

        await test("Inventory 5: Restock medicine (+15 units)", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}/restock`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    quantity: 15,
                    reason: "Quarterly hospital replenishment",
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.medicine.currentStock, 40);
            assert.strictEqual(data.data.movement.movementType, "RESTOCK");
        });

        await test("Inventory 6: Issue medicine for patient treatment (-10 units)", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}/issue`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    quantity: 10,
                    patientId,
                    reason: "Inpatient prescription dose",
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.medicine.currentStock, 30);
            assert.strictEqual(data.data.movement.movementType, "DISPENSED");
            assert.strictEqual(data.data.movement.patientId, patientId);
        });

        await test("Inventory 7: Reject issue when stock is insufficient", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}/issue`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    quantity: 100,
                    patientId,
                }),
            });
            assert.strictEqual(res.status, 409);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert.strictEqual(data.currentStock, 30);
        });

        await test("Inventory 8: Adjust stock manually to 5 units", async () => {
            const res = await fetch(`${base}/api/inventory/medicines/${medicineId}/adjust`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    newStock: 5,
                    reason: "Stock audit discrepancy correction",
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.medicine.currentStock, 5);
            assert.strictEqual(data.data.movement.movementType, "ADJUSTMENT");
        });

        await test("Inventory 9: Trigger Low-stock alert (stock <= threshold)", async () => {
            const res = await fetch(`${base}/api/inventory/low-stock`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.count >= 1);
            const alertItem = data.data.find((m) => m.id === medicineId);
            assert.ok(alertItem, "Medicine should be returned in low-stock alert list");
            assert.strictEqual(alertItem.currentStock, 5);
        });

        await test("Inventory 10: List stock movement history", async () => {
            const res = await fetch(`${base}/api/inventory/movements?medicineId=${medicineId}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.count >= 4);
            const types = data.data.map((m) => m.movementType);
            assert.ok(types.includes("RESTOCK"));
            assert.ok(types.includes("DISPENSED"));
            assert.ok(types.includes("ADJUSTMENT"));
        });

    } finally {
        await new Promise((resolve) => server.close(resolve));
        await prisma.$disconnect();
    }

    console.log("==================================================");
    console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log("==================================================");

    if (failedTests > 0) {
        process.exitCode = 1;
    }
}

runInventoryAndOPDTests();

