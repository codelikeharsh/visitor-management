const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Optional: auto-remove after 90 days
    expires: '90d',
  },
});

module.exports = mongoose.model("FCMToken", fcmTokenSchema);
