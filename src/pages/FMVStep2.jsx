
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FMVStep2 = ({ formData, setFormData }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    navigate("/fmvcalculator/result");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Step 2: NIL Deal Information</h2>
        {[
          { name: "followers", placeholder: "Social Media Followers" },
          { name: "engagementRate", placeholder: "Engagement Rate (%)" },
          { name: "deliverables", placeholder: "Number of Deliverables" },
          { name: "timeCommitment", placeholder: "Time Commitment (hrs/month)" },
          { name: "dealDuration", placeholder: "Deal Duration (e.g., Jan–Mar 2025)" },
          { name: "dealLength", placeholder: "Total Deal Length (e.g., 3 months)" }
        ].map(({ name, placeholder }) => (
          <input
            key={name}
            type="text"
            name={name}
            placeholder={placeholder}
            value={formData[name] || ""}
            onChange={handleChange}
            style={styles.input}
          />
        ))}
        <select name="dealType" value={formData.dealType || ""} onChange={handleChange} style={styles.input}>
          <option value="">Select Deal Type</option>
          <option value="Social Media">Social Media</option>
          <option value="Appearance">Appearance</option>
          <option value="Endorsement">Endorsement</option>
          <option value="Event Hosting">Event Hosting</option>
        </select>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={{ ...styles.button, backgroundColor: "#444", color: "white" }} onClick={() => navigate("/fmvcalculator/step1")}>Back</button>
          <button style={styles.button} onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#1a1a1a",
    color: "white",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem"
  },
  card: {
    backgroundColor: "#2C2F36",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
  },
  heading: {
    textAlign: "center",
    marginBottom: "1.5rem"
  },
  input: {
    width: "100%",
    marginBottom: "1rem",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem"
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    backgroundColor: "#88E788",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

export default FMVStep2;
