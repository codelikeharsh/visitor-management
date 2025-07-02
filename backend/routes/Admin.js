const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin"); // ✅ import Admin model

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ success: return admin data (you can issue a token in future)
    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: { username: admin.username }, // Don’t send password
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
