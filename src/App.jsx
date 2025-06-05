
import React, { useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Athletes from "./pages/Athletes";
import Universities from "./pages/Universities";
import Collectives from "./pages/Collectives";
import About from "./pages/About";
import FMVStep1 from "./pages/FMVStep1";
import FMVStep2 from "./pages/FMVStep2";
import FMVResult from "./pages/FMVResult";

const App = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const centerLinks = [
    { path: "/athletes", label: "Athletes" },
    { path: "/universities", label: "Universities" },
    { path: "/collectives", label: "Collectives" },
    { path: "/about", label: "About" }
  ];

  const rightLinks = [
    { path: "/contact", label: "Contact" },
    { path: "/signin", label: "Sign In" }
  ];

  return (
    <div>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to right, #2C2F36, #1F1F23)',
        padding: '1rem 2rem',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #444'
      }}>
        {/* Logo Section */}
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#144D3D',
            padding: '0.3rem 0.75rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem', lineHeight: '1.2' }}>
              FAIR PLAY<br />NIL
            </span>
          </div>
        </NavLink>

        {/* Center Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {centerLinks.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === index;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  color: isHovered || isActive ? '#88E788' : 'white',
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right Links */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {rightLinks.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  color: isActive ? '#88E788' : 'white',
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
          <NavLink to="/fmvcalculator/step1">
            <button style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#88E788",
              color: "#1a1a1a",
              fontWeight: "600",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(136, 231, 136, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Try Now
            </button>
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/collectives" element={<Collectives />} />
        <Route path="/fmvcalculator/step1" element={<FMVStep1 formData={formData} setFormData={setFormData} />} />
        <Route path="/fmvcalculator/step2" element={<FMVStep2 formData={formData} setFormData={setFormData} />} />
        <Route path="/fmvcalculator/result" element={<FMVResult />} />
        {/* Placeholder routes */}
        <Route path="/contact" element={<div style={{ padding: '2rem', color: 'white' }}>Contact Page Placeholder</div>} />
        <Route path="/signin" element={<div style={{ padding: '2rem', color: 'white' }}>Sign In Page Placeholder</div>} />
      </Routes>
    </div>
  );
};

export default App;
