// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FMVCalculator from "./pages/FMVCalculator";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* All /fmvcalculator subroutes handled by FMVCalculator */}
        <Route path="/fmvcalculator/*" element={<FMVCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
