import React, { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND}/admin/login`, {
        username,
        password,
      });

      console.log("Login response:", res.data); // ✅ Debugging output

      localStorage.setItem("admin-auth", "true");

      // ✅ Fix: store the correct admin username from response
      const adminUsername = res.data.admin?.username;
      if (adminUsername) {
        localStorage.setItem("admin-username", adminUsername);
      } else {
        console.error("admin.username missing in login response");
      }

      onLogin(adminUsername); // ✅ Pass username back to App.js

    } catch (err) {
      console.error("Login failed:", err);
      setError("❌ Invalid username or password");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Admin Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              required
            />
            <span onClick={() => setShowPass(!showPass)} style={styles.eye}>
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? <div style={styles.loader}></div> : "Login"}
          </button>
        </form>

        {error && <div style={styles.errorBox}>{error}</div>}

        <p style={styles.footer}>© {new Date().getFullYear()} Admin Portal</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "linear-gradient(135deg, #2c3e50, #3498db)",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
  },
  title: {
    marginBottom: "1.5rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    padding: "0.75rem",
    paddingRight: "40px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    width: "100%",
  },
  eye: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "1.1rem",
    userSelect: "none",
    lineHeight: 1,
  },
  button: {
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: "20px",
    height: "20px",
    border: "3px solid #fff",
    borderTop: "3px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorBox: {
    backgroundColor: "#ffe6e6",
    color: "#cc0000",
    padding: "0.6rem",
    marginTop: "1rem",
    borderRadius: "6px",
    fontWeight: "500",
  },
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.8rem",
    color: "#888",
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AdminLogin;
