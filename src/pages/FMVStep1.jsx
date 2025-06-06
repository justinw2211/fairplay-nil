
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FMVStep1 = ({ formData, setFormData }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Step 1: Create Your Profile</h2>
        {["fullName", "email", "password", "dob", "school", "sport", "gradYear"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field === "dob" ? "Date of Birth (YYYY-MM-DD)" : field === "gradYear" ? "Graduation Year" : field.replace(/([A-Z])/g, " $1")}
            value={formData[field] || ""}
            onChange={handleChange}
            style={styles.input}
          />
        ))}
        <select name="gender" value={formData.gender || ""} onChange={handleChange} style={styles.input}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button style={styles.button} onClick={() => navigate("/fmvcalculator/step2")}>Next</button>
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
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    backgroundColor: "#88E788",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

export default FMVStep1;
