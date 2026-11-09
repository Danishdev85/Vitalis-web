const dotenv = require("dotenv");
dotenv.config();

const { connectDatabase } = require("./config/db");
const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/admin");
const doctorRoutes = require("./routes/doctors");
const departmentRoutes = require("./routes/departments");
const appointmentRoutes = require("./routes/appointments");
const availabilityRoutes = require("./routes/availability");
const contactRoutes = require("./routes/contact");
const statsRoutes = require("./routes/stats");
const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

// -------------------------
// Health Check
// -------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vitalis Clinic API is running successfully.",
  });
});

// -------------------------
// API Routes
// -------------------------

app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);

// -------------------------
// 404 Handler
// -------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// -------------------------
// Global Error Handler
// -------------------------
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Vitalis API running on http://localhost:${PORT}`);
  });
}

startServer();