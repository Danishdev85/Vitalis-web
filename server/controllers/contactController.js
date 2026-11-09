const { pool } = require("../config/db");

// ======================================
// Submit a Contact Message (Public)
// ======================================
const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name, email, subject || null, message]
    );

    res.status(201).json({
      success: true,
      message: "Your message has been sent. We'll get back to you within one business day.",
      messageId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again.",
    });
  }
};

// ======================================
// Get All Messages (Admin)
// ======================================
const getAllMessages = async (req, res) => {
  try {
    const { unread_only } = req.query;

    let query = "SELECT * FROM contact_messages";
    const params = [];

    if (unread_only === "true") {
      query += " WHERE is_read = FALSE";
    }

    query += " ORDER BY created_at DESC";

    const [messages] = await pool.execute(query, params);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// ======================================
// Mark a Message as Read (Admin)
// ======================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      "UPDATE contact_messages SET is_read = TRUE WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Message marked as read.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};

// ======================================
// Delete a Message (Admin)
// ======================================
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute("DELETE FROM contact_messages WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Message deleted.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};

module.exports = {
  submitMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
};