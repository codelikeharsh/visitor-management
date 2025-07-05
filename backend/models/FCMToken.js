const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema(
  {
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

      // ⏱️ Optional: Automatically delete token after 90 days (MongoDB TTL index)
      expires: '90d',
    },

    // 🔁 Optional: Track last usage
    // lastUsedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("FCMToken", fcmTokenSchema);
