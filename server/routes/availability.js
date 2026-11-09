const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/auth");

const {
  getDoctorAvailabilityList,
  addAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

// Public — patients/frontend can view a doctor's weekly schedule pattern
router.get("/doctor/:doctorId", getDoctorAvailabilityList);

// Admin only — manage the schedule
router.post("/doctor/:doctorId", authenticateAdmin, addAvailability);
router.put("/:id", authenticateAdmin, updateAvailability);
router.delete("/:id", authenticateAdmin, deleteAvailability);

module.exports = router;