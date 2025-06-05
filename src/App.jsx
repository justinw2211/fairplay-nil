
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Athletes from "./pages/Athletes";
import Universities from "./pages/Universities";
import Collectives from "./pages/Collectives";
import About from "./pages/About";
import FMVCalculator from "./pages/FMVCalculator";

const App = () => (
  <div>
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#181818',
      padding: '1rem 2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <div style={{
          backgroundColor: '#144D3D',
          padding: '0.3rem 0.75rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
            FAIR PLAY<br/>NIL
          </span>
        </div>
      </NavLink>
      <div style={{ display: 'flex', gap: '20px' }}>
        <NavLink to="/" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          fontWeight: 'bold',
          textDecoration: 'none'
        })}>Home</NavLink>
        <NavLink to="/about" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none'
        })}>About</NavLink>
        <NavLink to="/athletes" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none'
        })}>Athletes</NavLink>
        <NavLink to="/universities" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none'
        })}>Universities</NavLink>
        <NavLink to="/collectives" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none'
        })}>Collectives</NavLink>
        <NavLink to="/fmvcalculator" style={({ isActive }) => ({
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none'
        })}>FMV Calculator</NavLink>
      </div>
    </nav>

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/athletes" element={<Athletes />} />
      <Route path="/universities" element={<Universities />} />
      <Route path="/collectives" element={<Collectives />} />
      <Route path="/fmvcalculator" element={<FMVCalculator />} />
    </Routes>
  </div>
);

export default App;
