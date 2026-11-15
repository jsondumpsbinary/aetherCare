const assert = require("node:assert");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = require("../app");
const prisma = require("../config/db");

async function runE2ETests() {
    console.log("==================================================");
    console.log("   AETHERCARE END-TO-END VERIFICATION TEST SUITE  ");
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
                    name: "E2E Administrator",
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

        let testWardId;
        let testBed1Id;
        let testBed2Id;
        let testPatient1Id;
        let testPatient2Id;
        let testAdmissionId;

        await test("Step 1: Create a ward", async () => {
            const res = await fetch(`${base}/api/wards`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: `E2E Ward ${Date.now()}`,
                    description: "End to end testing ward",
                }),
            });
            assert.strictEqual(res.status, 201);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            testWardId = data.data.id;
            assert.ok(testWardId > 0);
        });

        await test("Step 2: Create two beds in the ward", async () => {
            const timestamp = Date.now();
            const res1 = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: `E2E-BED-1-${timestamp}`,
                    wardId: testWardId,
                    bedType: "GENERAL",
                }),
            });
            assert.strictEqual(res1.status, 201);
            const data1 = await res1.json();
            testBed1Id = data1.data.id;
            assert.strictEqual(data1.data.status, "AVAILABLE");

            const res2 = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: `E2E-BED-2-${timestamp}`,
                    wardId: testWardId,
                    bedType: "ICU",
                }),
            });
            assert.strictEqual(res2.status, 201);
            const data2 = await res2.json();
            testBed2Id = data2.data.id;
            assert.strictEqual(data2.data.status, "AVAILABLE");
        });

        await test("Step 3: Obtain/register patient ID from Patient Management", async () => {
            const res1 = await fetch(`${base}/api/patients`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: "E2E Test Patient Alpha",
                    phone: "9112233445",
                }),
            });
            assert.strictEqual(res1.status, 201);
            const data1 = await res1.json();
            testPatient1Id = data1.data.id;

            const res2 = await fetch(`${base}/api/patients`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: "E2E Test Patient Beta",
                    phone: "9112233446",
                }),
            });
            assert.strictEqual(res2.status, 201);
            const data2 = await res2.json();
            testPatient2Id = data2.data.id;
        });

        await test("Step 4: Fetch available beds", async () => {
            const res = await fetch(`${base}/api/beds/available?wardId=${testWardId}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.count >= 2);
            const bed1Found = data.data.find((b) => b.id === testBed1Id);
            assert.ok(bed1Found);
            assert.strictEqual(bed1Found.status, "AVAILABLE");
        });

        await test("Step 5: Admit the patient to the first bed", async () => {
            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId: testPatient1Id,
                    bedId: testBed1Id,
                    reason: "Acute post-operative monitoring",
                }),
            });
            assert.strictEqual(res.status, 201);
            const data = await res.json();
            testAdmissionId = data.data.id;
            assert.strictEqual(data.data.status, "ADMITTED");
        });

        await test("Step 6: Verify the bed becomes OCCUPIED", async () => {
            const res = await fetch(`${base}/api/beds/${testBed1Id}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "OCCUPIED");
        });

        await test("Step 7: Verify the admission becomes ADMITTED", async () => {
            const res = await fetch(`${base}/api/admissions/${testAdmissionId}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "ADMITTED");
            assert.strictEqual(data.data.patientId, testPatient1Id);
            assert.strictEqual(data.data.bedId, testBed1Id);
        });

        await test("Step 8 & 9: Attempt to assign same bed again -> rejected", async () => {
            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId: testPatient2Id,
                    bedId: testBed1Id,
                }),
            });
            assert.strictEqual(res.status, 409);
            const data = await res.json();
            assert.strictEqual(data.success, false);
        });

        await test("Step 10 & 11: Attempt to admit same patient to another bed -> rejected", async () => {
            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId: testPatient1Id,
                    bedId: testBed2Id,
                }),
            });
            assert.strictEqual(res.status, 409);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert.match(data.message, /active admission/i);
        });

        await test("Step 12: Discharge the patient", async () => {
            const res = await fetch(`${base}/api/admissions/${testAdmissionId}/discharge`, {
                method: "PATCH",
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
        });

        await test("Step 13: Verify the admission becomes DISCHARGED", async () => {
            const res = await fetch(`${base}/api/admissions/${testAdmissionId}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "DISCHARGED");
            assert.ok(data.data.dischargeDate !== null);
        });

        await test("Step 14: Verify the bed becomes AVAILABLE", async () => {
            const res = await fetch(`${base}/api/beds/${testBed1Id}`, {
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.status, "AVAILABLE");
        });

        await test("Step 15 & 16: Attempt duplicate discharge -> rejected", async () => {
            const res = await fetch(`${base}/api/admissions/${testAdmissionId}/discharge`, {
                method: "PATCH",
                headers: authHeaders,
            });
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
        });

        await test("Validation: Invalid patient ID returns 404", async () => {
            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ patientId: 999999, bedId: testBed2Id }),
            });
            assert.strictEqual(res.status, 404);
        });

        await test("Validation: Invalid bed ID returns 404", async () => {
            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ patientId: testPatient2Id, bedId: 999999 }),
            });
            assert.strictEqual(res.status, 404);
        });

        await test("Validation: Duplicate bed number returns 409", async () => {
            const bed = await prisma.bed.findUnique({ where: { id: testBed1Id } });
            const res = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: bed.bedNumber,
                    wardId: testWardId,
                }),
            });
            assert.strictEqual(res.status, 409);
        });

        await test("Validation: Invalid ward ID returns 404", async () => {
            const res = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: `BED-INV-WARD-${Date.now()}`,
                    wardId: 888888,
                }),
            });
            assert.strictEqual(res.status, 404);
        });

        await test("Validation: Maintenance bed assignment rejected with 400", async () => {
            const maintBedRes = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: `BED-MAINT-${Date.now()}`,
                    wardId: testWardId,
                    status: "MAINTENANCE",
                }),
            });
            const maintBed = (await maintBedRes.json()).data;

            const res = await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId: testPatient2Id,
                    bedId: maintBed.id,
                }),
            });
            assert.strictEqual(res.status, 400);
        });

        await test("Validation: Occupied bed cannot be manually marked available", async () => {
            await fetch(`${base}/api/admissions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    patientId: testPatient2Id,
                    bedId: testBed2Id,
                }),
            });

            const res = await fetch(`${base}/api/beds/${testBed2Id}`, {
                method: "PATCH",
                headers: authHeaders,
                body: JSON.stringify({ status: "AVAILABLE" }),
            });
            assert.strictEqual(res.status, 400);
        });

        await test("Concurrency: Parallel admission requests for same bed", async () => {
            const freshBedRes = await fetch(`${base}/api/beds`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    bedNumber: `CONCUR-BED-${Date.now()}`,
                    wardId: testWardId,
                }),
            });
            const freshBed = (await freshBedRes.json()).data;

            const pA = (await (await fetch(`${base}/api/patients`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ name: "Patient Concurrent A", phone: "9000000001" }),
            })).json()).data;

            const pB = (await (await fetch(`${base}/api/patients`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ name: "Patient Concurrent B", phone: "9000000002" }),
            })).json()).data;

            const [resA, resB] = await Promise.all([
                fetch(`${base}/api/admissions`, {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ patientId: pA.id, bedId: freshBed.id }),
                }),
                fetch(`${base}/api/admissions`, {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ patientId: pB.id, bedId: freshBed.id }),
                }),
            ]);

            const statuses = [resA.status, resB.status];
            assert.ok(statuses.includes(201), "One request should succeed with 201");
            assert.ok(statuses.includes(409), "Conflicting request should fail with 409");
        });

    } finally {
        server.close();
        await prisma.$disconnect();
    }

    console.log("==================================================");
    console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log("==================================================");

    if (failedTests > 0) {
        process.exit(1);
    }
}

runE2ETests();
