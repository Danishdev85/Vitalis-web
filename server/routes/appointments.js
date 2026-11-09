const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/auth");

const {
  createAppointment,
  lookupAppointment,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

// Public (guest) routes
router.post("/", createAppointment);
router.get("/lookup", lookupAppointment);
router.put("/cancel", cancelAppointment);

// Admin routes
router.get("/", authenticateAdmin, getAllAppointments);
router.put("/:id", authenticateAdmin, updateAppointmentStatus);

module.exports = router;