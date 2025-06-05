
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

const NavItem = ({ path, label, index, hoveredIndex, setHoveredIndex }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const isHovered = hoveredIndex === index;

  return (
    <NavLink
      to={path}
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
      {label}
    </NavLink>
  );
};

const App = () => {
  const [formData, setFormData] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/athletes", label: "Athletes" },
    { path: "/universities", label: "Universities" },
    { path: "/collectives", label: "Collectives" },
    { path: "/fmvcalculator/step1", label: "FMV Calculator" }
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
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
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
        <div style={{ display: 'flex', gap: '20px' }}>
          {navItems.map((item, index) => (
            <NavItem
              key={item.path}
              path={item.path}
              label={item.label}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
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
      </Routes>
    </div>
  );
};

export default App;
