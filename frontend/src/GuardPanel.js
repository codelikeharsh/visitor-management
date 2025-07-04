import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const GuardPanel = () => {
  const [approvedVisitors, setApprovedVisitors] = useState([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await axios.get(`${BACKEND}/visitors`);
        const todayDate = new Date().toISOString().split("T")[0];
        setToday(
          new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );

        const approvedToday = res.data.filter((v) => {
          const createdDate = new Date(v.createdAt).toISOString().split("T")[0];
          return v.status === "approved" && createdDate === todayDate;
        });

        setApprovedVisitors(approvedToday);
      } catch (err) {
        console.error("Failed to load approved visitors", err);
      }
    };

    fetchApproved();
    const interval = setInterval(fetchApproved, 15000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <Helmet>
        <title>Guard Panel - The Waste Management Co.</title>
      </Helmet>

      {/* Header with Logo and Company Name */}
      <div style={styles.header}>
        <img
          src="https://i.ibb.co/BVtrc6bv/file-00000000c68061f597b5d88c579c8394.png"
          alt="The Waste Management (WM) Co."
          style={styles.logo}
        />
        <h2 style={styles.companyName}>The Waste Management (WM) Co.</h2>
        <p style={styles.date}>{today}</p>
      </div>

      {/* Visitor List */}
      <div style={styles.listWrapper}>
        {approvedVisitors.length === 0 ? (
          <p style={styles.noVisitors}>No approved visitors for today.</p>
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
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem 1rem",
    background: "#eef3f7",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    paddingTop: "0.5rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logo: {
    height: "80px",
    marginBottom: "0.1rem",
    borderRadius: "8px",
    marginTop: 0,
  },
  companyName: {
    fontFamily: "'Figtree', sans-serif",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "0.2rem",
    marginTop: 0,
    lineHeight: "1.2",
  },
  date: {
    fontSize: "1rem",
    color: "#555",
  },
  listWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "700px",
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderLeft: "6px solid #2ecc71",
  },
  image: {
    width: "160px",
    marginTop: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  noVisitors: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#999",
    marginTop: "2rem",
  },
};

export default GuardPanel;
