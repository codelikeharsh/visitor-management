import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisitorForm from "./VisitorForm";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin"; // New login component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VisitorPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
};

const VisitorPage = () => (
  <div style={container}>
    <div style={formBox}>
      <h2 style={heading}>Visitor Entry Form</h2>
      <VisitorForm />
    </div>

    <div style={infoBox}>
      <h3 style={{ marginBottom: "1rem" }}>🌿 About the Plant</h3>
      <ul style={listStyle}>
        <li>📍 Location: Indore, Madhya Pradesh</li>
        <li>🏭 India’s 1st Green Waste Processing Plant (PPP model)</li>
        <li>💰 IMC earns ₹3,000 per tonne of processed waste</li>
        <li>♻️ Converts wood waste into pellets, compost & briquettes</li>
        <li>🚛 Receives waste from 130+ institutions daily</li>
        <li>🌱 Reduces 18 tonnes of CO₂ emissions per day</li>
      </ul>
    </div>
  </div>
);

const container = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  padding: "2rem",
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
};

const formBox = {
  flex: "1 1 400px",
  margin: "1rem",
  padding: "2rem",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 0 20px rgba(0,0,0,0.1)",
};

const infoBox = {
  flex: "1 1 300px",
  margin: "1rem",
  padding: "2rem",
  background: "#e8f5e9",
  borderRadius: "12px",
  boxShadow: "0 0 15px rgba(0,0,0,0.05)",
  color: "#2e7d32",
  fontWeight: "500",
};

const heading = {
  textAlign: "center",
  marginBottom: "1.5rem",
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  lineHeight: "1.8",
};

export default App;
