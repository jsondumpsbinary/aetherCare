const express = require("express");
const cors = require("cors");
const patientRoutes = require("./modules/patients/patient.routes");
const departmentRoutes = require("./modules/opd/department.routes");
const doctorRoutes = require("./modules/opd/doctor.routes");


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


module.exports = app;