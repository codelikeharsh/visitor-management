const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Visitor = require("./models/Visitor");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

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

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

// Upload and save visitor
app.post("/api/visitor", upload.single("photo"), async (req, res) => {
  const { name, phone, reason } = req.body;
  const file = req.file;

  if (!file) {
    console.error("❌ No file received in request");
    return res.status(400).json({ error: "No photo provided" });
  }

  console.log("📥 Received visitor data:", { name, phone, reason });

  try {
    // Upload to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "visitors" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary upload success:", result.secure_url);
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Save to MongoDB
    const newVisitor = new Visitor({
      name,
      phone,
      reason,
      photoPath: result.secure_url,
    });

    await newVisitor.save();
    console.log("✅ Visitor saved to MongoDB:", newVisitor._id);
    res.status(200).json({ message: "Visitor saved successfully!" });
  } catch (err) {
    console.error("❌ Error in visitor POST route:", err);
    res.status(500).json({ error: err.message || "Failed to save visitor" });
  }
});

// Get all visitors
app.get("/api/visitors", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    console.log(`📦 Fetched ${visitors.length} visitors`);
    res.status(200).json(visitors);
  } catch (err) {
    console.error("❌ Error fetching visitors:", err);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// Approve/reject visitor
app.patch("/api/visitor/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    console.warn("⚠️ Invalid status received:", status);
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await Visitor.findByIdAndUpdate(id, { status }, { new: true });
    console.log(`✅ Visitor ${id} updated to status: ${status}`);
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Error updating visitor status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Delete visitor
app.delete("/api/visitor/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Visitor.findByIdAndDelete(id);
    console.log(`🗑️ Visitor ${id} deleted from DB`);
    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting visitor:", err);
    res.status(500).json({ error: "Failed to delete visitor" });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
