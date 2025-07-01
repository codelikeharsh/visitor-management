import React, { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel"; // ✅ correct import

const AdminProtected = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return isAuthenticated ? (
    <AdminPanel /> // ✅ fixed this
  ) : (
    <AdminLogin onLogin={handleLoginSuccess} />
  );
};

export default AdminProtected;
