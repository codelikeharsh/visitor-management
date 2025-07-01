import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    try {
      await axios.patch(`${BACKEND}/visitor/${id}/status`, { status });
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
    <div style={{ padding: "2rem", background: "#f4f4f4", minHeight: "100vh" }}>
      {/* 🔒 Logout button */}
      <div style={styles.logoutWrapper}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🔒 Logout
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>👮 Admin Panel</h2>

      {/* Filter + Export Controls */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        <div>
          <label><strong>Filter by Status: </strong></label>
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
          <label><strong>Start Date: </strong></label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label><strong>End Date: </strong></label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button
          onClick={handleExport}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📁 Export Excel
        </button>
      </div>

      {/* Visitor List */}
      {filteredVisitors.length === 0 ? (
        <p style={{ textAlign: "center" }}>No visitor entries found.</p>
      ) : (
        filteredVisitors.map((v, index) => (
          <div
            key={v._id}
            style={{
              background: "#fff",
              marginBottom: "1.5rem",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 0 15px rgba(0,0,0,0.05)",
            }}
          >
            <p><strong>#{index + 1}</strong></p>
            <p><strong>Name:</strong> {v.name}</p>
            <p><strong>Phone:</strong> {v.phone}</p>
            <p><strong>Reason:</strong> {v.reason}</p>
            <p><strong>Time:</strong> {formatDate(v.createdAt)}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    v.status === "approved"
                      ? "green"
                      : v.status === "rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                }}
              >
                {v.status}
              </span>
            </p>

            {v.photoPath && (
              <img
                src={v.photoPath}
                alt="Visitor"
                style={{
                  width: "200px",
                  borderRadius: "8px",
                  marginTop: "1rem",
                }}
              />
            )}

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => handleUpdateStatus(v._id, "approved")}
                disabled={v.status === "approved"}
                style={{
                  background: "green",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(v._id, "rejected")}
                disabled={v.status === "rejected"}
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "6px",
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

// 🔧 Styles for Logout
const styles = {
  logoutWrapper: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    zIndex: 1000,
  },
  logoutBtn: {
    backgroundColor: "#e60000",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },
};

export default AdminPanel;
