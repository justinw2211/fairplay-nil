import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import FMVCalculator from "./pages/FMVCalculator";


ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route path="/calculator" element={<FMVCalculator />} />
    </Routes>
  </Router>
);
