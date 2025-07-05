import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const GuardPanel = () => {
  const [visitorsToday, setVisitorsToday] = useState([]);
  const [today, setToday] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const navigate = useNavigate();

  const fetchVisitors = async () => {
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

      const todayVisitors = res.data.filter((v) => {
        const createdDate = new Date(v.createdAt).toISOString().split("T")[0];
        return createdDate === todayDate;
      });

      setVisitorsToday(todayVisitors);
    } catch (err) {
      console.error("Failed to load visitors", err);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return { color: "green", fontWeight: "bold" };
      case "rejected":
        return { color: "red", fontWeight: "bold" };
      case "pending":
        return { color: "orange", fontWeight: "bold" };
      default:
        return {};
    }
  };

  const handleCheckout = async (id) => {
    setCheckoutLoading(id);
    try {
      await axios.patch(`${BACKEND}/visitor/${id}/checkout`);
      await fetchVisitors(); // refresh
    } catch (err) {
      console.error("Checkout failed", err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div style={styles.container}>
      <Helmet>
        <title>Guard Panel - The Waste Management Co.</title>
      </Helmet>

      {/* Header */}
      <div style={styles.header}>
        <img
          src="https://i.ibb.co/BVtrc6bv/file-00000000c68061f597b5d88c579c8394.png"
          alt="The Waste Management (WM) Co."
          style={styles.logo}
        />
        <h2 style={styles.companyName}>The Waste Management (WM) Co.</h2>
        <p style={styles.date}>{today}</p>

        <button onClick={() => navigate("/")} style={styles.manualBtn}>
          ➕ Manual Entry
        </button>
      </div>

      {/* Visitor List */}
      <div style={styles.listWrapper}>
        {visitorsToday.length === 0 ? (
          <p style={styles.noVisitors}>No visitors for today.</p>
        ) : (
          visitorsToday.map((v, index) => (
            <div key={v._id} style={styles.card}>
              <p><strong>#{index + 1}</strong></p>
              <p><strong>Name:</strong> {v.name}</p>
              <p><strong>Phone:</strong> {v.phone}</p>
              <p><strong>Company:</strong> {v.company || "N/A"}</p>
              <p><strong>Person to Meet:</strong> {v.personToMeet}</p>
              <p><strong>Purpose:</strong> {v.purpose}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={getStatusStyle(v.status)}>
                  {v.status.toUpperCase()}
                </span>
              </p>

              {v.photoPath && (
                <img src={v.photoPath} alt="Visitor" style={styles.image} />
              )}

              <div style={styles.footerRow}>
                {v.checkoutTime ? (
                  <p style={styles.checkoutText}>
                    ✅ <strong>Checked Out:</strong>{" "}
                    {new Date(v.checkoutTime).toLocaleTimeString()}
                  </p>
                ) : (
                  v.status === "approved" && (
                    <button
                      onClick={() => handleCheckout(v._id)}
                      style={{
                        ...styles.checkoutBtn,
                        backgroundColor:
                          checkoutLoading === v._id ? "#bbb" : "#e67e22",
                        cursor:
                          checkoutLoading === v._id
                            ? "not-allowed"
                            : "pointer",
                      }}
                      disabled={checkoutLoading === v._id}
                    >
                      🚪{" "}
                      {checkoutLoading === v._id
                        ? "Checking out..."
                        : "Mark as Out"}
                    </button>
                  )
                )}
              </div>
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
    borderRadius: "8px",
    marginTop: 0,
  },
  companyName: {
    fontFamily: "'Figtree', sans-serif",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "0.3rem",
  },
  date: {
    fontSize: "1rem",
    color: "#555",
  },
  manualBtn: {
    marginTop: "1rem",
    backgroundColor: "#0066cc",
    color: "#fff",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
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
    borderLeft: "6px solid #3498db",
  },
  image: {
    width: "100%",
    maxWidth: "200px",
    marginTop: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  footerRow: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "0.5rem",
  },
  checkoutBtn: {
    backgroundColor: "#e67e22",
    color: "#fff",
    padding: "0.6rem 1.2rem",
    fontSize: "0.95rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "250px",
  },
  checkoutText: {
    fontWeight: "bold",
    color: "#2ecc71",
    fontSize: "0.95rem",
    textAlign: "center",
  },
  noVisitors: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#999",
    marginTop: "2rem",
  },
};

export default GuardPanel;
