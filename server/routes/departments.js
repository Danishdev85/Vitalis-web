const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/auth");

const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

// Public routes
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);

// Protected (admin) routes
router.post("/", authenticateAdmin, createDepartment);
router.put("/:id", authenticateAdmin, updateDepartment);
router.delete("/:id", authenticateAdmin, deleteDepartment);

module.exports = router;