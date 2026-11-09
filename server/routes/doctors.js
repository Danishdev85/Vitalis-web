const express = require("express");

const router = express.Router();

const authenticateAdmin = require("../middleware/auth");

const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAvailability,

} = require("../controllers/doctorController");

// ======================================
// Public Routes
// ======================================

// Get all doctors
router.get("/", getAllDoctors);

// Get single doctor
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailability);

// ======================================
// Protected Routes (Admin)
// ======================================

// Add doctor
router.post("/", authenticateAdmin, createDoctor);

// Update doctor
router.put("/:id", authenticateAdmin, updateDoctor);

// Delete doctor
router.delete("/:id", authenticateAdmin, deleteDoctor);


module.exports = router;