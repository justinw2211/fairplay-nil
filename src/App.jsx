import React, { useState } from "react";
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Athletes from "./pages/Athletes";
import Universities from "./pages/Universities";
import Collectives from "./pages/Collectives";
import Brands from "./pages/Brands";
import AboutUs from "./pages/AboutUs";
import Security from "./pages/Security";
import Careers from "./pages/Careers";
import FMVCalculator from "./pages/FMVCalculator"; // robust survey parent
import FMVResult from "./pages/FMVResult"; // 🔧 added missing FMVResult

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [companyOpen, setCompanyOpen] = useState(false);

  const centerLinks = [
    { path: "/athletes", label: "Athletes" },
    { path: "/universities", label: "Universities" },
    { path: "/collectives", label: "Collectives" },
    { path: "/brands", label: "Brands" }
  ];

  const rightLinks = [
    { path: "/contact", label: "Contact" },
    { path: "/signin", label: "Sign In" }
  ];

  const companyMenu = [
    { path: "/aboutus", label: "About Us" },
    { path: "/security", label: "Security" },
    { path: "/careers", label: "Careers" }
  ];

  const isCompanyActive = companyMenu.some(item => location.pathname === item.path);

  return (
    <div>
      <div style={{ height: '1.2rem', backgroundColor: '#88E788' }}></div>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to right, #2C2F36, #1F1F23)',
        padding: '1.4rem 2rem',
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: '1.15rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #444',
        position: 'relative'
      }}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1.45rem',
            letterSpacing: '0.5px'
          }}>
            FAIR PLAY NIL
          </span>
        </NavLink>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginLeft: '-60px' }}>
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
                  cursor: "pointer",
                  transition: 'color 0.3s ease'
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
          <div
            onMouseEnter={() => setCompanyOpen(true)}
            onMouseLeave={() => setCompanyOpen(false)}
            style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
          >
            <div style={{
              color: companyOpen || isCompanyActive ? "#88E788" : "white",
              fontWeight: 500,
              fontSize: "1.15rem",
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
              height: "100%",
              padding: 0,
              paddingBottom: "0.5rem",
              textDecoration: "none",
              cursor: "pointer"
            }}>
              Company
            </div>
            <div style={{
              display: companyOpen ? 'block' : 'none',
              position: 'absolute',
              top: "calc(100% + 4px)",
              left: 0,
              backgroundColor: '#2C2F36',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              padding: '0.5rem 0',
              zIndex: 1000
            }}>
              {companyMenu.map(item => (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: '0.5rem 1.5rem',
                    color: location.pathname === item.path ? '#88E788' : 'white',
                    cursor: "pointer",
                    whiteSpace: 'nowrap',
                    fontWeight: 400,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#3A3F47"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
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
                  cursor: "pointer",
                  transition: 'color 0.3s ease'
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
          <NavLink to="/fmvcalculator/step1">
            <button style={{
              padding: "0.7rem 1.5rem",
              backgroundColor: "#88E788",
              color: "#1a1a1a",
              fontWeight: "700",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.06)";
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(136, 231, 136, 0.35)";
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
        {/* Robust parent handles all survey steps */}
        <Route path="/fmvcalculator/*" element={<FMVCalculator />} />

        {/* All your main nav pages as before */}
        <Route path="/" element={<Home />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/collectives" element={<Collectives />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<div style={{ padding: '2rem', color: 'white' }}>Contact Page Placeholder</div>} />
        <Route path="/signin" element={<div style={{ padding: '2rem', color: 'white' }}>Sign In Page Placeholder</div>} />
      </Routes>
    </div>
  );
};

export default App;
