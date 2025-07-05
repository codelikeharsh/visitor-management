const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Visitor = require("./models/Visitor");
const Admin = require("./models/Admin");
const FCMToken = require("./models/FCMToken"); // 🔔 Token model
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const cron = require("node-cron");
const { exportToExcel } = require("./exportVisitors");
const exportRouter = require("./routes/export");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Backend is running.");
});

// ✅ Admin Login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const adminDoc = await Admin.findOne({ username });
    if (!adminDoc || adminDoc.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.status(200).json({
      success: true,
      message: "Login successful",
      admin: { username: adminDoc.username },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Store FCM Token
app.post("/subscribe", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const exists = await FCMToken.findOne({ token });
    if (!exists) {
      await FCMToken.create({ token });
      console.log("✅ FCM Token stored:", token);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Token save failed:", err);
    res.status(500).json({ error: "Failed to save token" });
  }
});

// ✅ Create Visitor + Send Notification
app.post("/visitor", upload.single("photo"), async (req, res) => {
  const { name, phone, company, personToMeet, purpose } = req.body;
  const file = req.file;
  if (!file || !name || !phone || !personToMeet || !purpose) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Upload photo
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "visitors" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const photo = await uploadToCloudinary();

    const newVisitor = await Visitor.create({
      name,
      phone,
      company: company || "N/A",
      personToMeet,
      purpose,
      photoPath: photo.secure_url,
      createdAt: new Date(),
    });

    // 🔔 Send push to all stored FCM tokens
    const tokens = await FCMToken.find({});
    const messages = tokens.map((t) => ({
      notification: {
        title: "🚨 New Visitor Entry",
        body: `${name} is waiting for approval.`,
      },
      token: t.token,
    }));

    // Send messages in parallel
    const responses = await Promise.allSettled(
      messages.map((msg) => admin.messaging().send(msg))
    );

    console.log(`🔔 Notifications sent: ${responses.length}`);

    res.status(200).json({ message: "Visitor saved!", id: newVisitor._id });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to create visitor" });
  }
});

// ✅ Get Visitor by ID
app.get("/visitors/:id", async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });
    res.status(200).json(visitor);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visitor" });
  }
});

// ✅ Get All Visitors
app.get("/visitors", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json(visitors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
});

// ✅ Update Visitor Status
app.patch("/visitor/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, adminUsername } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const fields = { status };
    if (adminUsername) {
      fields[status === "approved" ? "approvedBy" : "rejectedBy"] = adminUsername;
    }

    const updated = await Visitor.findByIdAndUpdate(id, fields, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ✅ Mark Checkout
app.patch("/visitor/:id/checkout", async (req, res) => {
  try {
    const updated = await Visitor.findByIdAndUpdate(
      req.params.id,
      { checkoutTime: new Date() },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Checkout failed" });
  }
});

// ✅ Delete Visitor
app.delete("/visitor/:id", async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Visitor deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ✅ Export Excel
app.use("/", exportRouter);

// ✅ Cron Job
cron.schedule("0 18 * * *", async () => {
  console.log("📅 Exporting visitors...");
  await exportToExcel();
});

// ✅ Start Server
const PORT = process.env.PORT || 5050;
// 🔔 Manual push notification test

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
