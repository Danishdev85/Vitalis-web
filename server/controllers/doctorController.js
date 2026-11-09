const { pool } = require("../config/db");
const { getDayName, buildAvailableSlots } = require("../utils/slotGenerator");

// ======================================
// Get All Doctors
// ======================================
const getAllDoctors = async (req, res) => {
  try {
    const { department } = req.query;

    let query = `
      SELECT
        doctors.*,
        departments.name AS department_name
      FROM doctors
      INNER JOIN departments
      ON doctors.department_id = departments.id
    `;
    const params = [];

    if (department) {
      query += " WHERE doctors.department_id = ?";
      params.push(department);
    }

    query += " ORDER BY doctors.name ASC";

    const [doctors] = await pool.execute(query, params);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
    });
  }
};

// ======================================
// Get Doctor By ID
// ======================================
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [doctor] = await pool.execute(
      `
      SELECT
        doctors.*,
        departments.name AS department_name
      FROM doctors
      INNER JOIN departments
      ON doctors.department_id = departments.id
      WHERE doctors.id = ?
      `,
      [id]
    );

    if (doctor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      success: true,
      doctor: doctor[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor.",
    });
  }
};

// ======================================
// Create Doctor
// ======================================
const createDoctor = async (req, res) => {
  try {
    const {
      department_id,
      name,
      specialty,
      bio,
      years_experience,
      consultation_fee,
      image,
    } = req.body;

    if (!department_id || !name || !specialty) {
      return res.status(400).json({
        success: false,
        message: "Department, name and specialty are required.",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO doctors
      (
        department_id,
        name,
        specialty,
        bio,
        years_experience,
        consultation_fee,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        department_id,
        name,
        specialty,
        bio || null,
        years_experience || 0,
        consultation_fee || 0,
        image || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully.",
      doctorId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create doctor.",
    });
  }
};

// ======================================
// Update Doctor
// ======================================
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      department_id,
      name,
      specialty,
      bio,
      years_experience,
      consultation_fee,
      image,
    } = req.body;

    await pool.execute(
      `
      UPDATE doctors
      SET
        department_id = ?,
        name = ?,
        specialty = ?,
        bio = ?,
        years_experience = ?,
        consultation_fee = ?,
        image = ?
      WHERE id = ?
      `,
      [
        department_id,
        name,
        specialty,
        bio,
        years_experience,
        consultation_fee,
        image,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update doctor.",
    });
  }
};

// ======================================
// Delete Doctor
// ======================================
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      "DELETE FROM doctors WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete doctor.",
    });
  }
};


// ======================================
// Get Doctor Availability for a Date
// ======================================
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // expected format: 'YYYY-MM-DD'

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "A 'date' query parameter is required (YYYY-MM-DD).",
      });
    }

    const dayName = getDayName(date);

    // 1. Get the doctor's working hours for this day of week
    const [availabilityRows] = await pool.execute(
      `SELECT start_time, end_time
       FROM doctor_availability
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = TRUE`,
      [id, dayName]
    );

    // 2. Get already-booked slots for this doctor on this date (ignore cancelled ones)
    const [bookedRows] = await pool.execute(
      `SELECT time_slot
       FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [id, date]
    );

    const bookedSlots = bookedRows.map((r) => r.time_slot);
    const slots = buildAvailableSlots(availabilityRows, bookedSlots, date);

    res.status(200).json({
      success: true,
      date,
      day: dayName,
      slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability.",
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAvailability,
};