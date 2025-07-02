const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Visitor = require("./models/Visitor");
const Admin = require("./models/Admin");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const cron = require("node-cron");
const { exportToExcel } = require("./exportVisitors");
const exportRouter = require("./routes/export");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Multer config (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

// Admin login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: { username: admin.username },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create visitor
app.post("/visitor", upload.single("photo"), async (req, res) => {
  const { name, phone, reason } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No photo provided" });

  try {
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "visitors" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    const newVisitor = new Visitor({
      name,
      phone,
      reason,
      photoPath: result.secure_url,
    });

    await newVisitor.save();
    res.status(200).json({ message: "Visitor saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save visitor" });
  }
});

// Get all visitors
app.get("/visitors", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json(visitors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// Update visitor status with admin tracking
app.patch("/visitor/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, adminUsername } = req.body;
  console.log("Received adminUsername:", adminUsername); // 👈 Add this line

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updateFields = { status };
if (status === "approved" && adminUsername)
  updateFields.approvedBy = adminUsername;
if (status === "rejected" && adminUsername)
  updateFields.rejectedBy = adminUsername;

    const updated = await Visitor.findByIdAndUpdate(id, updateFields, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Delete visitor
app.delete("/visitor/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Visitor.findByIdAndDelete(id);
    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete visitor" });
  }
});

// Export Excel route
app.use("/", exportRouter);

// Cron Job: Daily 6 PM
cron.schedule("0 18 * * *", async () => {
  console.log("📅 Running daily visitor export at 6 PM...");
  await exportToExcel();
});

// Start server
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
