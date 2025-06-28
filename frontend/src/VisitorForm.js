import React, { useRef, useState } from "react";
import axios from "axios";

const VisitorForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera access denied", err);
      setMessage("❌ Unable to access camera.");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
      // Stop the camera stream after capturing the image
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setStream(null);
      }
    }, "image/jpeg");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoBlob) {
      setMessage("❌ Please take a photo before submitting.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("reason", formData.reason);
    data.append("photo", photoBlob, "visitor.jpg");

    try {
      await axios.post("http://localhost:5050/api/visitor", data);
      setMessage("✅ Visitor submitted successfully!");
      setFormData({ name: "", phone: "", reason: "" });
      setPhotoBlob(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit visitor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <textarea
        name="reason"
        placeholder="Reason for Visit"
        value={formData.reason}
        onChange={handleChange}
        required
        rows={3}
      />

      <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: "8px" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: "1rem" }}>
        <button type="button" onClick={startCamera}>🎥 Start Camera</button>
        <button type="button" onClick={takePhoto}>📸 Capture Photo</button>
      </div>

      {photoBlob && <p style={{ color: "green" }}>✅ Photo captured!</p>}

      <button type="submit" style={{ backgroundColor: "#4CAF50", color: "#fff", padding: "1rem" }}>
        🚪 Submit Entry
      </button>

      {message && (
        <div style={{ marginTop: "1rem", textAlign: "center", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}
    </form>
  );
};

export default VisitorForm;
