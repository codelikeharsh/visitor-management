import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

const VisitorStatus = () => {
  const { id } = useParams();
  const [visitor, setVisitor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${BACKEND}/visitors/${id}`)
      .then((res) => setVisitor(res.data))
      .catch(() => setError("❌ Visitor not found or server error."));
  }, [id]);

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!visitor) return <p style={{ textAlign: "center" }}>Loading visitor data...</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "orange";
    }
  };

  return (
    <div style={styles.wrapper}>
      <Helmet>
        <title>Visitor Status - {visitor.name}</title>
      </Helmet>

      {/* ✅ Header with Logo and Company Name */}
      <div style={styles.header}>
        <img
          src="https://i.ibb.co/BVtrc6bv/file-00000000c68061f597b5d88c579c8394.png"
          alt="The Waste Management (WM) Co."
          style={styles.logo}
        />
        <h2 style={styles.companyName}>The Waste Management (WM) Co.</h2>
      </div>

      <h2 style={styles.heading}>Visitor Confirmation</h2>

      <img src={visitor.photoPath} alt="Visitor" style={styles.photo} />

      <div style={styles.details}>
        <p><strong>Name:</strong> {visitor.name}</p>
        <p><strong>Phone:</strong> {visitor.phone}</p>
        <p><strong>Company:</strong> {visitor.company}</p>
        <p><strong>Person to Meet:</strong> {visitor.personToMeet}</p>
        <p><strong>Purpose:</strong> {visitor.purpose}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span style={{ color: getStatusColor(visitor.status), fontWeight: "bold" }}>
            {visitor.status.toUpperCase()}
          </span>
        </p>

        {(visitor.status === "approved" || visitor.status === "rejected") && (
          <p>
            <strong>{visitor.status === "approved" ? "Approved At" : "Rejected At"}:</strong>{" "}
            {new Date(visitor.updatedAt).toLocaleString()}
          </p>
        )}
        {visitor.checkoutTime && (
          <p>
            <strong>Checked Out At:</strong>{" "}
            {new Date(visitor.checkoutTime).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
  maxWidth: "600px",
  margin: "0 auto", // Removed top margin
  padding: "1.5rem",
  paddingTop: "1rem", // Reduce top padding
  borderRadius: "12px",
  backgroundColor: "#fffdf9",
  boxShadow: "0 0 12px rgba(0, 0, 0, 0.08)",
  fontFamily: "'Segoe UI', sans-serif",
},

  header: {
  textAlign: "center",
  marginTop: "0",         // Remove extra margin
  marginBottom: "1.5rem", // Keep spacing below
  paddingTop: "0.5rem",   // Minimal top padding
},
  logo: {
    height: "80px",
    borderRadius: "8px",
  },
  companyName: {
    fontFamily: "'Figtree', sans-serif",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: "0.5rem",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#222",
  },
  photo: {
    display: "block",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 1.5rem",
    border: "3px solid #4CAF50",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  details: {
    fontSize: "1rem",
    lineHeight: "1.6",
  },
};

export default VisitorStatus;
