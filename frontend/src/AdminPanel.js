import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { Helmet } from "react-helmet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requestFCMToken, onMessageListener } from "./firebaseInit";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportFields, setShowExportFields] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const adminUsername = localStorage.getItem("admin-username") || "Unknown";

  useEffect(() => {
    fetchVisitors();
    setupPushNotifications();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(`${BACKEND}/visitors`);
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setVisitors(sorted);
    } catch (err) {
      console.error("Error fetching visitors", err);
    }
  };

  const setupPushNotifications = async () => {
    try {
      const token = await requestFCMToken();
      if (token) {
        await axios.post(`${BACKEND}/subscribe`, { token });
      }

      onMessageListener()
        .then((payload) => {
          const { title, body } = payload.notification;
          toast.info(`${title}: ${body}`);
        })
        .catch((err) => console.error("FCM listener error:", err));
    } catch (err) {
      console.error("Push setup failed", err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
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
      alert("Cannot delete a visitor with pending status.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this visitor?")) return;

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
      setShowExportFields(false);
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error("Export failed", err);
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
    filter === "all" ? visitors : visitors.filter((v) => v.status === filter);

  return (
    <div style={styles.container}>
      <Helmet>
        <title>Admin Panel - The Waste Management Co.</title>
      </Helmet>

      <div style={styles.headerSection}>
        <img
          src="https://i.ibb.co/BVtrc6bv/file-00000000c68061f597b5d88c579c8394.png"
          alt="The Waste Management (WM) Co."
          style={styles.logo}
        />
        <h2 style={styles.companyName}>The Waste Management (WM) Co.</h2>

        <div style={styles.centeredProfile}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.profileButton}>
            <span style={styles.avatarCircle}>{adminUsername[0]?.toUpperCase()}</span>
            <span style={styles.username}>{adminUsername}</span>
            <span style={styles.arrow}>{dropdownOpen ? "▲" : "▼"}</span>
          </div>
          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownItem}>
                Logged in as <strong>{adminUsername}</strong>
              </div>
              <hr style={{ margin: "0.5rem 0" }} />
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.filterWrapper}>
        <div style={styles.statusFilter}>
          <label><strong>Status:</strong></label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {!showExportFields ? (
          <button onClick={() => setShowExportFields(true)} style={styles.exportBtn}>Export</button>
        ) : (
          <>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
            <button onClick={handleExport} style={styles.downloadBtn}>⬇️ Download</button>
            <button onClick={() => { setShowExportFields(false); setStartDate(""); setEndDate(""); }} style={styles.cancelBtn}>Cancel</button>
          </>
        )}
      </div>

      <div style={styles.visitorList}>
        {filteredVisitors.length === 0 ? (
          <p style={{ textAlign: "center" }}>No visitor entries found.</p>
        ) : (
          filteredVisitors.map((v, index) => (
            <div key={v._id} style={styles.card}>
              <p><strong>#{index + 1}</strong></p>
              <p><strong>Name:</strong> {v.name}</p>
              <p><strong>Phone:</strong> {v.phone}</p>
              <p><strong>Company:</strong> {v.company || "N/A"}</p>
              <p><strong>Person to Meet:</strong> {v.personToMeet}</p>
              <p><strong>Purpose:</strong> {v.purpose}</p>
              <p><strong>Time:</strong> {formatDate(v.createdAt)}</p>
              <p><strong>Status:</strong>{" "}
                <span style={{
                  color: v.status === "approved" ? "green" : v.status === "rejected" ? "red" : "orange",
                  fontWeight: "bold"
                }}>
                  {v.status}
                </span>
              </p>
              {v.status === "approved" && v.approvedBy && <p><strong>Approved By:</strong> {v.approvedBy}</p>}
              {v.status === "rejected" && v.rejectedBy && <p><strong>Rejected By:</strong> {v.rejectedBy}</p>}
              {v.photoPath && <img src={v.photoPath} alt="Visitor" style={styles.image} />}
              <div style={styles.actions}>
                <button
                  onClick={() => handleUpdateStatus(v._id, "approved")}
                  disabled={v.status !== "pending"}
                  style={{ ...styles.actionBtn, background: v.status === "pending" ? "green" : "#ccc" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(v._id, "rejected")}
                  disabled={v.status !== "pending"}
                  style={{ ...styles.actionBtn, background: v.status === "pending" ? "red" : "#ccc" }}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDelete(v._id, v.status)}
                  style={{ ...styles.actionBtn, background: "#444" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};


const styles = {
  container: {
    padding: "1rem",
    fontFamily: "'Figtree', sans-serif",
    background: "#f4f4f4",
    minHeight: "100vh",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "1.2rem",
  },
  logo: {
    height: "80px",
    marginBottom: "0.1rem",
    borderRadius: "8px",
  },
  companyName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "0.2rem",
    marginTop: 0,
  },
  centeredProfile: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
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
    backgroundColor: "#000000",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  username: {
    fontWeight: "bold",
    fontSize: "0.95rem",
    color: "#333",
  },
  arrow: {
    fontSize: "0.8rem",
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: "120%",
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
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  statusFilter: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  select: {
    padding: "0.5rem",
    borderRadius: "6px",
    minWidth: "150px",
  },
  dateInput: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  exportBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  downloadBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#00C000",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#999",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  visitorList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0,0,0,0.05)",
  },
  image: {
    width: "100%",
    maxWidth: "200px",
    marginTop: "1rem",
    borderRadius: "8px",
  },
  actions: {
    marginTop: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  actionBtn: {
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AdminPanel;
