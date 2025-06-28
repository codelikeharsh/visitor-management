const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const Visitor = require("./models/Visitor"); // Import model

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve photo files

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Create new visitor
app.post("/api/visitor", upload.single("photo"), async (req, res) => {
  const { name, phone, reason } = req.body;
  const photoPath = req.file ? req.file.path : "";

  try {
    const newVisitor = new Visitor({
      name,
      phone,
      reason,
      photoPath,
      status: "pending", // default
    });

    await newVisitor.save();
    res.status(200).json({ message: "Visitor saved to MongoDB!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save visitor." });
  }
});

// 🔍 Get all visitors
app.get("/api/visitors", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json(visitors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// ✅ Approve or reject visitor
app.patch("/api/visitor/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await Visitor.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
