const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/statsController");

// Admin only
router.get("/", authenticateAdmin, getDashboardStats);

module.exports = router;