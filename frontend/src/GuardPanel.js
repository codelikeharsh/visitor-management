import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const GuardPanel = () => {
  const [approvedVisitors, setApprovedVisitors] = useState([]);

  useEffect(() => {
    const fetchApproved = async () => {
  try {
    const res = await axios.get(`${BACKEND}/visitors`);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const approvedToday = res.data.filter((v) => {
      const createdDate = new Date(v.createdAt).toISOString().split("T")[0];
      return v.status === "approved" && createdDate === today;
    });

    setApprovedVisitors(approvedToday);
  } catch (err) {
    console.error("Failed to load approved visitors", err);
  }
};


    fetchApproved();
    const interval = setInterval(fetchApproved, 15000); // refresh every 15s
    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>✅ Approved Visitors</h2>

      {approvedVisitors.length === 0 ? (
        <p style={{ textAlign: "center" }}>No approved visitors right now.</p>
      ) : (
        approvedVisitors.map((v, index) => (
          <div key={v._id} style={styles.card}>
            <p><strong>#{index + 1}</strong></p>
            <p><strong>Name:</strong> {v.name}</p>
            <p><strong>Phone:</strong> {v.phone}</p>
            <p><strong>Reason:</strong> {v.reason}</p>
            <p><strong>Status:</strong> ✅ Approved</p>

            {v.photoPath && (
              <img
                src={v.photoPath}
                alt="Visitor"
                style={styles.image}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    background: "#f9f9f9",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    padding: "1rem",
    marginBottom: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  image: {
    width: "180px",
    marginTop: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
};

export default GuardPanel;
