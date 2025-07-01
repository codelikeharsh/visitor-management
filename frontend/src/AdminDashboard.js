import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [visitors, setVisitors] = useState([]);

  const fetchVisitors = async () => {
    try {
      const res = await axios.get("https://visitor-managment.onrender.com/api/visitor");
      setVisitors(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch visitors:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`https://visitor-managment.onrender.com/api/visitor/${id}/status`, {
        status,
      });
      fetchVisitors();
    } catch (err) {
      console.error("❌ Failed to update status:", err);
    }
  };

  const deleteVisitor = async (id, status) => {
    if (status === "pending") {
      alert("⚠️ Cannot delete visitor with 'pending' status.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this visitor?")) return;

    try {
      await axios.delete(`https://visitor-managment.onrender.com/api/visitor/${id}`);
      fetchVisitors();
    } catch (err) {
      console.error("❌ Failed to delete visitor:", err);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🛂 Admin Panel – Visitor Approvals</h2>

      {visitors.length === 0 ? (
        <p style={{ textAlign: "center" }}>No visitors yet.</p>
      ) : (
        visitors.map((v) => (
          <div key={v._id} style={styles.card}>
            <div style={styles.info}>
              <p><strong>Name:</strong> {v.name}</p>
              <p><strong>Phone:</strong> {v.phone}</p>
              <p><strong>Reason:</strong> {v.reason}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: v.status === "approved" ? "green" : v.status === "rejected" ? "red" : "orange" }}>
                  {v.status}
                </span>
              </p>
              {v.photoPath && (
                <img
                  src={v.photoPath}
                  alt="Visitor"
                  style={styles.image}
                />
              )}
            </div>

            <div style={styles.actions}>
              <button
                onClick={() => updateStatus(v._id, "approved")}
                disabled={v.status === "approved"}
                style={{ ...styles.button, backgroundColor: "#4CAF50" }}
              >
                ✅ Approve
              </button>

              <button
                onClick={() => updateStatus(v._id, "rejected")}
                disabled={v.status === "rejected"}
                style={{ ...styles.button, backgroundColor: "#f44336" }}
              >
                ❌ Reject
              </button>

              <button
                onClick={() => deleteVisitor(v._id, v.status)}
                disabled={v.status === "pending"}
                style={{
                  ...styles.button,
                  backgroundColor: "#333",
                  opacity: v.status === "pending" ? 0.5 : 1,
                  cursor: v.status === "pending" ? "not-allowed" : "pointer",
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

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    position: "relative",
    zIndex: 0,
  },
  info: {
    zIndex: 1,
  },
  image: {
    width: "150px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    display: "block",
    zIndex: 1,
  },
  actions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    zIndex: 1,
  },
  button: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default AdminDashboard;
