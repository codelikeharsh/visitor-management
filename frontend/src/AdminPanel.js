import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchVisitors = async () => {
    try {
      const res = await axios.get("https://visitor-managment.onrender.com/api/visitors");
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
      await axios.put(`https://visitor-managment.onrender.com/api/visitors${id}`, { status });
      fetchVisitors(); // Refresh list
    } catch (err) {
      console.error("Status update failed", err);
    }
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
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>👮 Admin Panel</h2>

      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <label style={{ marginRight: "1rem", fontWeight: "bold" }}>
          Filter by Status:
        </label>
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

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button
                onClick={() => handleUpdateStatus(v._id, "approved")}
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
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPanel;
