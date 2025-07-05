// exportVisitors.js
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const Visitor = require("./models/Visitor");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.error("❌ DB Error", err));

const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Visitors");

  // ✅ Updated Columns
  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Company", key: "company", width: 20 },
    { header: "Person to Meet", key: "personToMeet", width: 25 },
    { header: "Purpose", key: "purpose", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Check-in Time", key: "createdAt", width: 25 },
    { header: "Check-out Time", key: "checkoutTime", width: 25 },
    { header: "Photo URL", key: "photoPath", width: 40 },
  ];

  const visitors = await Visitor.find();

  visitors.forEach((v) => {
    sheet.addRow({
      name: v.name,
      phone: v.phone,
      company: v.company || "N/A",
      personToMeet: v.personToMeet,
      purpose: v.purpose,
      status: v.status,
      createdAt: v.createdAt
        ? v.createdAt.toLocaleString("en-IN")
        : "N/A",
      checkoutTime: v.checkoutTime
        ? new Date(v.checkoutTime).toLocaleString("en-IN")
        : "Not checked out",
      photoPath: v.photoPath,
    });
  });

  await workbook.xlsx.writeFile("visitors.xlsx");
  console.log("✅ visitors.xlsx created successfully");
};

module.exports = { exportToExcel };
