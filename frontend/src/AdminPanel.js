import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const adminUsername = localStorage.getItem("admin-username") || "Unknown";

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(`${BACKEND}/visitors`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setVisitors(sorted);
    } catch (err) {
      console.error("Error fetching visitors", err);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const adminUsername = localStorage.getItem("admin-username");
    try {
      await axios.patch(`${BACKEND}/visitor/${id}/status`, {
        status,
        adminUsername,
      });
      fetchVisitors();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleDelete = async (id, status) => {
    if (status === "pending") {
      alert("You cannot delete a visitor with pending status.");
      return;
    }

    const confirm = window.confirm("Are you sure you want to delete this visitor?");
    if (!confirm) return;

    try {
      await axios.delete(`${BACKEND}/visitor/${id}`);
      fetchVisitors();
    } catch (err) {
      console.error("Failed to delete visitor", err);
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const res = await axios.get(`${BACKEND}/export`, {
        params: { start: startDate, end: endDate },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `visitors_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-username");
    window.location.href = "/login";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredVisitors =
    filter === "all"
      ? visitors
      : visitors.filter((v) => v.status === filter);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} className="admin-header">
        <h3 style={styles.title}>Admin Panel</h3>

        <div style={styles.profileContainer}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={styles.profileButton}
          >
            <span style={styles.avatarCircle}>
              {adminUsername[0]?.toUpperCase()}
            </span>
            <span style={styles.username}>{adminUsername}</span>
            <span style={styles.arrow}>{dropdownOpen ? "▲" : "▼"}</span>
          </div>

          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownItem}>
                👤 <strong>{adminUsername}</strong>
              </div>
              <hr style={{ margin: "0.5rem 0" }} />
              <button onClick={handleLogout} style={styles.logoutBtn}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterWrapper}>
        <div>
          <label><strong>Status:</strong></label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "6px" }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label><strong>Start:</strong></label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label><strong>End:</strong></label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button
          onClick={handleExport}
          style={styles.exportBtn}
        >
          📁 Export Excel
        </button>
      </div>

      {/* Visitor Cards */}
      {filteredVisitors.length === 0 ? (
        <p style={{ textAlign: "center" }}>No visitor entries found.</p>
      ) : (
        filteredVisitors.map((v, index) => (
          <div key={v._id} style={styles.card}>
            <p><strong>#{index + 1}</strong></p>
            <p><strong>Name:</strong> {v.name}</p>
            <p><strong>Phone:</strong> {v.phone}</p>
            <p><strong>Reason:</strong> {v.reason}</p>
            <p><strong>Time:</strong> {formatDate(v.createdAt)}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{
                color:
                  v.status === "approved" ? "green" :
                  v.status === "rejected" ? "red" : "orange",
                fontWeight: "bold"
              }}>
                {v.status}
              </span>
            </p>
            {v.status === "approved" && v.approvedBy && (
              <p><strong>Approved By:</strong> {v.approvedBy}</p>
            )}
            {v.status === "rejected" && v.rejectedBy && (
              <p><strong>Rejected By:</strong> {v.rejectedBy}</p>
            )}

            {v.photoPath && (
              <img
                src={v.photoPath}
                alt="Visitor"
                style={styles.image}
              />
            )}

            <div style={styles.actions}>
              <button
                onClick={() => handleUpdateStatus(v._id, "approved")}
                disabled={v.status !== "pending"}
                style={{
                  background: v.status === "pending" ? "green" : "#ccc",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: v.status === "pending" ? "pointer" : "not-allowed",
                }}
              >
                ✅ Approve
              </button>

              <button
                onClick={() => handleUpdateStatus(v._id, "rejected")}
                disabled={v.status !== "pending"}
                style={{
                  background: v.status === "pending" ? "red" : "#ccc",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: v.status === "pending" ? "pointer" : "not-allowed",
                }}
              >
                ❌ Reject
              </button>

              <button
                onClick={() => handleDelete(v._id, v.status)}
                style={{
                  background: "#444",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ✅ Styles
const styles = {
  container: {
    padding: "1rem",
    background: "#f9f9f9",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.7rem",
    fontWeight: "600",
    color: "#333",
  },
  profileContainer: {
    position: "relative",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    background: "#f0f0f0",
    borderRadius: "25px",
    padding: "0.4rem 1rem",
    border: "1px solid #ccc",
    cursor: "pointer",
    gap: "0.5rem",
  },
  avatarCircle: {
    width: "32px",
    height: "32px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  username: {
    fontWeight: "500",
    fontSize: "0.95rem",
    color: "#333",
  },
  arrow: {
    fontSize: "0.8rem",
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: "115%",
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    padding: "1rem",
    zIndex: 1000,
    minWidth: "200px",
  },
  dropdownItem: {
    fontSize: "0.95rem",
    color: "#333",
    marginBottom: "0.5rem",
  },
  logoutBtn: {
    backgroundColor: "#e60000",
    color: "#fff",
    padding: "0.6rem 1rem",
    border: "none",
    borderRadius: "6px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "bold",
  },
  filterWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  exportBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    marginBottom: "1.5rem",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0,0,0,0.05)",
  },
  image: {
    width: "200px",
    borderRadius: "8px",
    marginTop: "1rem",
  },
  actions: {
    marginTop: "1rem",
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
};

export default AdminPanel;
