const { pool } = require("../config/db");

// ======================================
// Get Dashboard Summary Stats (Admin)
// ======================================
const getDashboardStats = async (req, res) => {
  try {
    // Total appointments
    const [[{ total_appointments }]] = await pool.execute(
      "SELECT COUNT(*) AS total_appointments FROM appointments"
    );

    // Pending appointments
    const [[{ pending_count }]] = await pool.execute(
      "SELECT COUNT(*) AS pending_count FROM appointments WHERE status = 'pending'"
    );

    // Confirmed appointments
    const [[{ confirmed_count }]] = await pool.execute(
      "SELECT COUNT(*) AS confirmed_count FROM appointments WHERE status = 'confirmed'"
    );

    // Today's appointments (any status except cancelled)
    const [[{ today_count }]] = await pool.execute(
      `SELECT COUNT(*) AS today_count FROM appointments
       WHERE appointment_date = CURDATE() AND status != 'cancelled'`
    );

    // Total doctors
    const [[{ total_doctors }]] = await pool.execute(
      "SELECT COUNT(*) AS total_doctors FROM doctors"
    );

    // Total departments
    const [[{ total_departments }]] = await pool.execute(
      "SELECT COUNT(*) AS total_departments FROM departments"
    );

    // Unread contact messages
    const [[{ unread_messages }]] = await pool.execute(
      "SELECT COUNT(*) AS unread_messages FROM contact_messages WHERE is_read = FALSE"
    );

    // Appointments per department (for a simple breakdown chart)
    const [byDepartment] = await pool.execute(`
      SELECT departments.name AS department, COUNT(appointments.id) AS count
      FROM appointments
      INNER JOIN doctors ON appointments.doctor_id = doctors.id
      INNER JOIN departments ON doctors.department_id = departments.id
      WHERE appointments.status != 'cancelled'
      GROUP BY departments.id, departments.name
      ORDER BY count DESC
    `);

    // Appointments over the last 7 days (for a simple trend chart)
    const [last7Days] = await pool.execute(`
      SELECT appointment_date, COUNT(*) AS count
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND status != 'cancelled'
      GROUP BY appointment_date
      ORDER BY appointment_date ASC
    `);

    res.status(200).json({
      success: true,
      stats: {
        total_appointments,
        pending_count,
        confirmed_count,
        today_count,
        total_doctors,
        total_departments,
        unread_messages,
        by_department: byDepartment,
        last_7_days: last7Days,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats.",
    });
  }
};

module.exports = { getDashboardStats };