
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
      background: 'linear-gradient(to right, #2C2F36, #1F1F23)',
      padding: '1rem 2rem',
      fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 8px rgba(0,0,0,0.3)', borderBottom: '1px solid #444'
    }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease' }}>
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
        <NavLink to="/" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          fontWeight: 'bold',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
        })}>Home</NavLink>
        <NavLink to="/about" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
        })}>About</NavLink>
        <NavLink to="/athletes" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
        })}>Athletes</NavLink>
        <NavLink to="/universities" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
        })}>Universities</NavLink>
        <NavLink to="/collectives" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
        })}>Collectives</NavLink>
        <NavLink to="/fmvcalculator" style={({ isActive }) => ({ transition: 'color 0.3s',
          color: isActive ? '#88E788' : 'white',
          textDecoration: 'none', cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s ease'
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
