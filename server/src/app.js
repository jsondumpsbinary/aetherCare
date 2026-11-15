
const express = require("express");
const cors = require("cors");

const patientRoutes = require("./modules/patients/patient.routes");
const departmentRoutes = require("./modules/opd/department.routes");
const doctorRoutes = require("./modules/opd/doctor.routes");
const visitRoutes = require("./modules/opd/visit.routes");
const wardRoutes = require("./modules/beds/ward.routes");
const bedRoutes = require("./modules/beds/bed.routes");
const admissionRoutes = require("./modules/admissions/admission.routes");
const authRoutes = require("./modules/auth/auth.routes");
const authenticate = require("./middleware/authenticate");
const authorize = require("./middleware/authorize");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "AetherCare API is running",
    });
});

// Public authentication endpoints
app.use("/api/auth", authRoutes);

// All hospital APIs require authentication
// Patients
app.use(
    "/api/patients",
    authenticate,
    authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
    patientRoutes
);

// Departments
app.use(
    "/api/departments",
    authenticate,
    authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
    departmentRoutes
);

// Doctors
app.use(
    "/api/doctors",
    authenticate,
    authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
    doctorRoutes
);

// OPD
app.use(
    "/api/opd-visits",
    authenticate,
    authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"),
    visitRoutes
);

// Wards
app.use(
    "/api/wards",
    authenticate,
    authorize("ADMIN", "NURSE", "RECEPTIONIST", "DOCTOR"),
    wardRoutes
);

// Beds
app.use(
    "/api/beds",
    authenticate,
    authorize("ADMIN", "NURSE", "RECEPTIONIST", "DOCTOR"),
    bedRoutes
);

// Admissions
app.use(
    "/api/admissions",
    authenticate,
    authorize("ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"),
    admissionRoutes
);

module.exports = app;
