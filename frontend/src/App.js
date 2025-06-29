import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VisitorForm from "./VisitorForm";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";
import "./App.css"; // ✅ You will create this file below

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
  <div className="page-container fade-in">
    <div className="gold-border">
      <h1 className="main-heading">
        Welcome to India's First PPP<br />Green Waste Processing Plant
      </h1>

      <img
        src="https://static.pib.gov.in/WriteReadData/userfiles/image/image002QLIF.jpg"
        alt="Green Waste Plant"
        className="plant-image"
      />

      <h2 className="form-heading">Visitor's Form</h2>

      <div className="form-wrapper">
        <VisitorForm />
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} Bicholi Hapsi Green Waste Plant. All rights reserved.
      </footer>
    </div>
  </div>
);

export default App;
