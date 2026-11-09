const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../middleware/auth");

const {
  submitMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
} = require("../controllers/contactController");

// Public — anyone can submit the contact form
router.post("/", submitMessage);

// Admin — view and manage messages
router.get("/", authenticateAdmin, getAllMessages);
router.put("/:id/read", authenticateAdmin, markAsRead);
router.delete("/:id", authenticateAdmin, deleteMessage);

module.exports = router;