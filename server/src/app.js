const express = require("express");
const cors = require("cors");
const patientRoutes = require("./modules/patients/patient.routes");
const departmentRoutes = require("./modules/opd/department.routes");
const doctorRoutes = require("./modules/opd/doctor.routes");
const wardRoutes = require("./modules/beds/ward.routes");
const bedRoutes = require("./modules/beds/bed.routes");
const admissionRoutes = require("./modules/admissions/admission.routes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "AetherCare API is running"
    });
});

app.use("/api/patients", patientRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/admissions", admissionRoutes);


module.exports = app;