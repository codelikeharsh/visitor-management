const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    reason: String,
    photoPath: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Visitor", visitorSchema);
