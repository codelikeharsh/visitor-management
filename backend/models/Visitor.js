const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, default: "N/A" },
    personToMeet: { type: String, required: true },
    purpose: { type: String, required: true },
    photoPath: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: String, default: null },
    rejectedBy: { type: String, default: null },
    checkoutTime: { type: Date, default: null },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
