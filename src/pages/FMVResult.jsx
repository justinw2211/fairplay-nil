
import React, { useEffect, useState } from "react";

const FMVResult = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setResult("$8,750");
      setLoading(false);
    }, 5000);
  }, []);

  const spinnerStyle = {
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #88E788",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem"
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loading}>
            <div style={spinnerStyle}></div>
            <p>Processing your FMV estimate...</p>
          </div>
        ) : (
          <div>
            <h2 style={styles.heading}>Your Estimated FMV</h2>
            <p style={styles.result}>{result}</p>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
  },
  heading: {
    fontSize: "1.75rem",
    marginBottom: "1rem"
  },
  result: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#88E788"
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default FMVResult;
