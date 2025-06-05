
import React from "react";

const Home = () => {
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
      <p style={{ fontSize: "1.25rem", fontWeight: "400", maxWidth: "700px", marginBottom: "2rem" }}>
        FairPlay NIL helps athletes and organizations understand the Fair Market Value of NIL deals — ensuring transparency and informed decision-making.
      </p>
    </div>
  );
};

export default Home;
