
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "90vh",
      backgroundColor: "#1a1a1a",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      textAlign: "center",
      padding: "1rem"
    }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "1rem" }}>
        Clarity Before Compliance
      </h1>
      <button 
        onClick={() => navigate('/fmvcalculator')}
        style={{
          backgroundColor: "#88E788",
          color: "#1a1a1a",
          border: "none",
          borderRadius: "8px",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "2rem",
          transition: "background-color 0.3s"
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "#76D476"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "#88E788"}
      >
        Access FMV Calculator
      </button>
      <p style={{ fontSize: "1.25rem", fontWeight: "400", maxWidth: "700px" }}>
        FairPlay NIL helps athletes and organizations understand the Fair Market Value of NIL deals — ensuring transparency and informed decision-making.
      </p>
    </div>
  );
};

export default Home;
