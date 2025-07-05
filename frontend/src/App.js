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
import VisitorStatus from "./VisitorStatus"; // ✅ New import
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("admin-auth") === "true"
  );

  const handleLogin = (username) => {
    localStorage.setItem("admin-auth", "true");
    localStorage.setItem("admin-username", username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-username");
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
        
        {/* ✅ New confirmation route */}
        <Route path="/visitor/:id" element={<VisitorStatus />} />
      </Routes>
    </Router>
  );
};

const VisitorPage = () => (
  <div className="page-container fade-in">
    <div className="gold-border">
      <h1 className="main-heading">
        Welcome to India's First Green Waste Processing Plant (TWM-IMC, Indore)
      </h1>

      <img
        src="https://i.ibb.co/FLt09h2L/Whats-App-Image-2025-07-05-at-21-47-16.jpg"
        alt="Green Waste Plant"
        className="plant-image"
      />

      <h2 className="form-heading">Visitor's Form</h2>

      <div className="form-wrapper">
        <VisitorForm />
      </div>

      <footer className="footer">
        <div>© {new Date().getFullYear()} The Waste Management (WM) Co.</div>
        <div>All Rights Reserved.</div>
        <div>Crafted with ❤️ by Harsh</div>
      </footer>
    </div>
  </div>
);

export default App;
