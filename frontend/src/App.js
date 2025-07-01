import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import VisitorForm from "./VisitorForm";
import AdminPanel from "./AdminPanel";
import AdminLogin from "./AdminLogin";
import GuardPanel from "./GuardPanel";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("admin-auth") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("admin-auth", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<VisitorPage />} />
        <Route
          path="/admin"
          element={
            isLoggedIn ? (
              <AdminPanel onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />
        <Route path="/guard" element={<GuardPanel />} />
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
