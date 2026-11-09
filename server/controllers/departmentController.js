const { pool } = require("../config/db");

// ======================================
// Get All Departments
// ======================================
const getAllDepartments = async (req, res) => {
  try {
    const [departments] = await pool.execute(
      "SELECT * FROM departments ORDER BY name ASC"
    );

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments.",
    });
  }
};

// ======================================
// Get Department By ID
// ======================================
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [department] = await pool.execute(
      "SELECT * FROM departments WHERE id = ?",
      [id]
    );

    if (department.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    res.status(200).json({
      success: true,
      department: department[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department.",
    });
  }
};

// ======================================
// Create Department
// ======================================
const createDepartment = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO departments (name, description, icon) VALUES (?, ?, ?)`,
      [name, description || null, icon || null]
    );

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      departmentId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create department.",
    });
  }
};

// ======================================
// Update Department
// ======================================
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    await pool.execute(
      `UPDATE departments SET name = ?, description = ?, icon = ? WHERE id = ?`,
      [name, description, icon, id]
    );

    res.status(200).json({
      success: true,
      message: "Department updated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update department.",
    });
  }
};

// ======================================
// Delete Department
// ======================================
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute("DELETE FROM departments WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete department.",
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};