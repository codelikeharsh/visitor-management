import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [visitors, setVisitors] = useState([]);

  // Fetch visitors
  const fetchVisitors = async () => {
    const res = await axios.get("http://localhost:5050/api/visitors");
    setVisitors(res.data);
  };

  // Approve or reject visitor
  const updateStatus = async (id, status) => {
    await axios.patch(`http://localhost:5050/api/visitor/${id}/status`, {
      status,
    });
    fetchVisitors(); // Refresh list
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🛂 Admin Panel – Visitor Approvals</h2>
      {visitors.length === 0 ? (
        <p>No visitors yet.</p>
      ) : (
        visitors.map((v) => (
          <div
            key={v._id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              margin: "1rem 0",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <p><strong>Name:</strong> {v.name}</p>
            <p><strong>Phone:</strong> {v.phone}</p>
            <p><strong>Reason:</strong> {v.reason}</p>
            <p><strong>Status:</strong> {v.status}</p>
            {v.photoPath && (
              <img
                src={`http://localhost:5050/${v.photoPath}`}
                alt="Visitor"
                style={{ width: "150px", marginTop: "10px" }}
              />
            )}
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => updateStatus(v._id, "approved")}
                disabled={v.status === "approved"}
                style={{ marginRight: "1rem" }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => updateStatus(v._id, "rejected")}
                disabled={v.status === "rejected"}
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

export default AdminDashboard;
