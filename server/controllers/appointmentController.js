const { pool } = require("../config/db");
const { generateConfirmationCode } = require("../utils/confirmationCode");
const { getDayName, buildAvailableSlots } = require("../utils/slotGenerator");

// ======================================
// Create Appointment (Guest Booking)
// ======================================
const createAppointment = async (req, res) => {
  try {
    const {
      doctor_id,
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      time_slot,
      reason,
    } = req.body;

    // Basic validation
    if (!doctor_id || !patient_name || !patient_email || !patient_phone || !appointment_date || !time_slot) {
      return res.status(400).json({
        success: false,
        message: "doctor_id, patient_name, patient_email, patient_phone, appointment_date, and time_slot are all required.",
      });
    }

    // Re-verify the slot is still actually free (protects against race conditions/double-booking)
    const dayName = getDayName(appointment_date);

    const [availabilityRows] = await pool.execute(
      `SELECT start_time, end_time
       FROM doctor_availability
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = TRUE`,
      [doctor_id, dayName]
    );

    const [bookedRows] = await pool.execute(
      `SELECT time_slot
       FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [doctor_id, appointment_date]
    );

    const bookedSlots = bookedRows.map((r) => r.time_slot);
    const freeSlots = buildAvailableSlots(availabilityRows, bookedSlots, appointment_date);
    const isStillFree = freeSlots.some((s) => s.time === time_slot);

    if (!isStillFree) {
      return res.status(409).json({
        success: false,
        message: "Sorry, that time slot was just taken. Please choose another.",
      });
    }

    // Generate a unique confirmation code (retry on the rare collision)
    let confirmationCode;
    let isUnique = false;
    while (!isUnique) {
      confirmationCode = generateConfirmationCode();
      const [existing] = await pool.execute(
        "SELECT id FROM appointments WHERE confirmation_code = ?",
        [confirmationCode]
      );
      isUnique = existing.length === 0;
    }

    const [result] = await pool.execute(
      `INSERT INTO appointments
        (doctor_id, patient_name, patient_email, patient_phone, appointment_date, time_slot, reason, confirmation_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [doctor_id, patient_name, patient_email, patient_phone, appointment_date, `${time_slot}:00`, reason || null, confirmationCode]
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: {
        id: result.insertId,
        confirmation_code: confirmationCode,
        doctor_id,
        patient_name,
        appointment_date,
        time_slot,
        status: "pending",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment.",
    });
  }
};

// ======================================
// Lookup Appointment (Guest — by code + contact)
// ======================================
const lookupAppointment = async (req, res) => {
  try {
    const { code, contact } = req.query;

    if (!code || !contact) {
      return res.status(400).json({
        success: false,
        message: "Confirmation code and contact (phone or email) are required.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        appointments.*,
        doctors.name AS doctor_name,
        doctors.specialty
       FROM appointments
       INNER JOIN doctors ON appointments.doctor_id = doctors.id
       WHERE appointments.confirmation_code = ?
         AND (appointments.patient_phone = ? OR appointments.patient_email = ?)`,
      [code.trim().toUpperCase(), contact.trim(), contact.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching appointment found.",
      });
    }

    res.status(200).json({
      success: true,
      appointment: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to look up appointment.",
    });
  }
};

// ======================================
// Cancel Appointment (Guest — by code + contact)
// ======================================
const cancelAppointment = async (req, res) => {
  try {
    const { code, contact } = req.body;

    if (!code || !contact) {
      return res.status(400).json({
        success: false,
        message: "Confirmation code and contact (phone or email) are required.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM appointments
       WHERE confirmation_code = ?
         AND (patient_phone = ? OR patient_email = ?)`,
      [code.trim().toUpperCase(), contact.trim(), contact.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching appointment found.",
      });
    }

    const appointment = rows[0];

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This appointment is already cancelled.",
      });
    }

    await pool.execute(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [appointment.id]
    );

    const [updatedRows] = await pool.execute(
      `SELECT
        appointments.*,
        doctors.name AS doctor_name,
        doctors.specialty
       FROM appointments
       INNER JOIN doctors ON appointments.doctor_id = doctors.id
       WHERE appointments.id = ?`,
      [appointment.id]
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
    });
  }
};

// ======================================
// Admin: Get All Appointments (optionally filtered by status)
// ======================================
const getAllAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        appointments.*,
        doctors.name AS doctor_name,
        doctors.specialty
      FROM appointments
      INNER JOIN doctors ON appointments.doctor_id = doctors.id
    `;
    const params = [];

    if (status) {
      query += " WHERE appointments.status = ?";
      params.push(status);
    }

    query += " ORDER BY appointments.appointment_date DESC, appointments.time_slot DESC";

    const [appointments] = await pool.execute(query, params);

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
    });
  }
};

// ======================================
// Admin: Update Appointment Status
// ======================================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    await pool.execute(
      "UPDATE appointments SET status = ? WHERE id = ?",
      [status, id]
    );

    res.status(200).json({
      success: true,
      message: "Appointment status updated.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status.",
    });
  }
};

module.exports = {
  createAppointment,
  lookupAppointment,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};