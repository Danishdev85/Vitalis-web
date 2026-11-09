const { pool } = require("../config/db");

const VALID_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

// ======================================
// Get Availability for a Doctor
// ======================================
const getDoctorAvailabilityList = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const [rows] = await pool.execute(
      `SELECT * FROM doctor_availability WHERE doctor_id = ? ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
      [doctorId]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      availability: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability.",
    });
  }
};

// ======================================
// Add Availability Slot (a working-hours block for one day)
// ======================================
const addAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { day_of_week, start_time, end_time } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "day_of_week, start_time, and end_time are required.",
      });
    }

    if (!VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({
        success: false,
        message: `day_of_week must be one of: ${VALID_DAYS.join(", ")}`,
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "start_time must be before end_time.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [doctorId, day_of_week, start_time, end_time]
    );

    res.status(201).json({
      success: true,
      message: "Availability added.",
      availabilityId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add availability.",
    });
  }
};

// ======================================
// Update an Availability Slot
// ======================================
const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, is_active } = req.body;

    if (day_of_week && !VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({
        success: false,
        message: `day_of_week must be one of: ${VALID_DAYS.join(", ")}`,
      });
    }

    await pool.execute(
      `UPDATE doctor_availability
       SET day_of_week = COALESCE(?, day_of_week),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [day_of_week || null, start_time || null, end_time || null, is_active ?? null, id]
    );

    res.status(200).json({
      success: true,
      message: "Availability updated.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability.",
    });
  }
};

// ======================================
// Delete an Availability Slot
// ======================================
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute("DELETE FROM doctor_availability WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Availability deleted.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete availability.",
    });
  }
};

module.exports = {
  getDoctorAvailabilityList,
  addAvailability,
  updateAvailability,
  deleteAvailability,
};