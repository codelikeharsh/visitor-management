// routes/export.js
const express = require("express");
const ExcelJS = require("exceljs");
const Visitor = require("../models/Visitor");

const router = express.Router();

router.get("/export", async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: "Missing date range" });

  try {
    const visitors = await Visitor.find({
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    });

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

    visitors.forEach(v => {
      sheet.addRow({
        name: v.name,
        phone: v.phone,
        reason: v.reason,
        status: v.status,
        createdAt: v.createdAt.toLocaleString("en-IN"),
        photoPath: v.photoPath,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=visitors-${start}-to-${end}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Export error:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

module.exports = router;
