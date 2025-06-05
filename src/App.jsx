import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Athletes from "./pages/Athletes";
import Universities from "./pages/Universities";
import Collectives from "./pages/Collectives";
import About from "./pages/About";

const App = () => (
  <div>
    <nav style={{ display: 'flex', gap: '20px', background: '#181818', padding: '1rem' }}>
      <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white', fontWeight: 'bold' })}>Home</NavLink>
      <NavLink to="/athletes" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white' })}>Athletes</NavLink>
      <NavLink to="/universities" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white' })}>Universities</NavLink>
      <NavLink to="/collectives" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white' })}>Collectives</NavLink>
      <NavLink to="/about" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white' })}>About Us</NavLink>
      <NavLink to="/calculator" style={({ isActive }) => ({ color: isActive ? '#88E788' : 'white' })}>FMV Calculator</NavLink>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/athletes" element={<Athletes />} />
      <Route path="/universities" element={<Universities />} />
      <Route path="/collectives" element={<Collectives />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </div>
);

export default App;
