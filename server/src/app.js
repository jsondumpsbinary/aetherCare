
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
const { authorizeMethods } = authorize;

const app = express();

const allHospitalRoles = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"];
const patientManagers = ["ADMIN", "RECEPTIONIST"];
const opdManagers = ["ADMIN", "RECEPTIONIST", "DOCTOR"];
const bedManagers = ["ADMIN", "NURSE"];
const admissionManagers = ["ADMIN", "RECEPTIONIST", "NURSE"];

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
    authorizeMethods({
        GET: allHospitalRoles,
        POST: patientManagers,
        PATCH: patientManagers,
        DELETE: patientManagers,
    }),
    patientRoutes
);

// Departments
app.use(
    "/api/departments",
    authenticate,
    authorizeMethods({
        GET: allHospitalRoles,
        POST: ["ADMIN"],
    }),
    departmentRoutes
);

// Doctors
app.use(
    "/api/doctors",
    authenticate,
    authorizeMethods({
        GET: allHospitalRoles,
        POST: ["ADMIN"],
    }),
    doctorRoutes
);

// OPD
app.use(
    "/api/opd-visits",
    authenticate,
    authorizeMethods({
        POST: opdManagers,
    }),
    visitRoutes
);

// Wards
app.use(
    "/api/wards",
    authenticate,
    authorizeMethods({
        GET: allHospitalRoles,
        POST: ["ADMIN"],
    }),
    wardRoutes
);

// Beds
app.use(
    "/api/beds",
    authenticate,
    authorizeMethods({
        GET: allHospitalRoles,
        POST: bedManagers,
        PATCH: bedManagers,
    }),
    bedRoutes
);

// Admissions
app.use(
    "/api/admissions",
    authenticate,
    authorizeMethods({
        GET: allHospitalRoles,
        POST: admissionManagers,
        PATCH: admissionManagers,
    }),
    admissionRoutes
);

module.exports = app;
