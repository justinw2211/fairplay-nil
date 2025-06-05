
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
      background: "linear-gradient(to bottom right, #1a1a1a, #121212)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      textAlign: "center",
      padding: "2rem",
      lineHeight: 1.5,
      letterSpacing: "0.25px"
    }}>
      <h1 style={{
        fontSize: "3rem",
        fontWeight: "800",
        marginBottom: "1rem",
        textShadow: "2px 2px 6px rgba(0,0,0,0.3)"
      }}>
        Clarity Before Compliance
      </h1>
      <button 
        onClick={() => navigate('/fmvcalculator')}
        style={{
          backgroundColor: "#88E788",
          color: "#1a1a1a",
          border: "none",
          borderRadius: "12px",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "2rem",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}
      >
        Access FMV Calculator
      </button>
      <p style={{
        fontSize: "1.25rem",
        fontWeight: "400",
        maxWidth: "700px",
        backgroundColor: "#222",
        padding: "1rem 2rem",
        borderRadius: "10px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
      }}>
        FairPlay NIL helps athletes and organizations understand the Fair Market Value of NIL deals — ensuring transparency and informed decision-making.
      </p>
    </div>
  );
};

export default Home;
