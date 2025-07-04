import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

const VisitorForm = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", reason: "" });
  const [message, setMessage] = useState("");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "phone" ? value.replace(/\D/g, "") : value });
  };

  const openCamera = () => {
    setCameraActive(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("❌ Camera access error:", err);
        setMessage("❌ Unable to access camera.");
      }
    }, 300);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 640, 480);
    const shutterSound = new Audio("https://www.soundjay.com/mechanical/photo-shutter-click-01.mp3");
    shutterSound.play().catch(() => console.warn("⚠️ Shutter sound blocked."));
    canvas.toBlob((blob) => {
      if (!blob) return;
      setPhotoBlob(new Blob([blob], { type: "image/jpeg" }));
      video.srcObject?.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      setCameraActive(false);
    }, "image/jpeg", 0.6);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.phone)) {
      setMessage("❌ Phone number must be exactly 10 digits.");
      return;
    }
    if (!photoBlob) {
      setMessage("❌ Please capture a photo first.");
      return;
    }
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("reason", formData.reason);
    data.append("photo", photoBlob, "visitor.jpg");
    try {
      setLoading(true);
      setProgress(10);
      await axios.post(`${BACKEND}/visitor`, data, {
        timeout: 10000,
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success("Visitor form submitted!");
      setMessage("");
      setFormData({ name: "", phone: "", reason: "" });
      setPhotoBlob(null);
    } catch (err) {
      console.error("❌ Submission failed:", err);
      setMessage("❌ Failed to submit visitor.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <Helmet>
        <title>Visitor App - The Waste Management Co.</title>
      </Helmet>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        style={styles.input}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        style={styles.input}
        maxLength="10"
        pattern="\d{10}"
        title="Enter exactly 10 digits"
        required
      />
      <textarea
        name="reason"
        placeholder="Reason for Visit"
        value={formData.reason}
        onChange={handleChange}
        style={styles.textarea}
        rows={3}
        required
      />

      {photoBlob && !cameraActive && (
        <img
          src={URL.createObjectURL(photoBlob)}
          alt="Captured"
          style={{ ...styles.photo, animation: "fadeIn 0.5s ease-in-out" }}
        />
      )}

      {!photoBlob && !cameraActive && (
        <button type="button" onClick={openCamera} style={styles.captureBtn}>
          📸 Capture Photo
        </button>
      )}

      {cameraActive && (
        <div style={styles.overlayWrapper}>
          <div style={styles.overlay}></div>
          <div style={styles.cameraContainer}>
            <video ref={videoRef} autoPlay style={styles.video} />
            <button type="button" onClick={capturePhoto} style={styles.shutter}></button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {loading && <progress max="100" value={progress} style={{ width: "100%", height: "10px" }} />}

      <button type="submit" style={styles.submitBtn} disabled={loading}>
        {loading ? "Submitting..." : "Submit Entry"}
      </button>

      {message && (
        <div style={{ marginTop: "1rem", textAlign: "center", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <ToastContainer position="top-center" autoClose={4000} />
    </form>
  );
};

const styles = {
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  captureBtn: {
    backgroundColor: "#000000",
    color: "#fff",
    padding: "0.8rem",
    borderRadius: "8px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
  cameraContainer: {
    position: "relative",
    width: "90%",
    maxWidth: "500px",
    zIndex: 1001,
  },
  video: {
    width: "100%",
    borderRadius: "12px",
  },
  shutter: {
    position: "absolute",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "60px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    border: "4px solid #4CAF50",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  photo: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #4CAF50",
    alignSelf: "center",
    marginTop: "1rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  },
  submitBtn: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "1rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  overlayWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(4px)",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1,
  },
};

export default VisitorForm;
