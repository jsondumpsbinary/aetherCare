const express = require("express");
const cors = require("cors");
const patientRoutes = require("./modules/patients/patient.routes");

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


module.exports = app;