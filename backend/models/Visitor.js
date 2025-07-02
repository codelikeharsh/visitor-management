const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    reason: String,
    photoPath: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: String, default: null },
    rejectedBy: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
