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

  sheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Reason", key: "reason", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Date", key: "createdAt", width: 25 },
    { header: "Photo URL", key: "photoPath", width: 40 },
  ];
module.exports = { exportToExcel };

  const visitors = await Visitor.find();

  visitors.forEach((v) => {
    sheet.addRow({
      name: v.name,
      phone: v.phone,
      reason: v.reason,
      status: v.status,
      createdAt: v.createdAt.toLocaleString("en-IN"),
      photoPath: v.photoPath,
    });
  });

  await workbook.xlsx.writeFile("visitors.xlsx");
  console.log("✅ visitors.xlsx created successfully");
};

exportToExcel();
module.exports = { exportToExcel };

