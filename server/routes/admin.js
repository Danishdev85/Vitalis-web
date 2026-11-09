const express = require("express");

const router = express.Router();

const {
  loginAdmin,
  getProfile,
} = require("../controllers/adminController");

const authenticateAdmin = require("../middleware/auth");

// ======================================
// Public Routes
// ======================================

// Admin Login
router.post("/login", loginAdmin);

// ======================================
// Protected Routes
// ======================================

// Logged-in Admin Profile
router.get("/profile", authenticateAdmin, getProfile);

module.exports = router;