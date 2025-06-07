// src/pages/FMVCalculator.jsx

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import FMVStep1 from "./FMVStep1";
import FMVStep2 from "./FMVStep2";
import FMVReviewStep from "./FMVReviewStep"; // Comment/remove if you don’t have this

export default function FMVCalculator() {
  const [formData, setFormData] = useState({});

  return (
    <Routes>
      <Route
        path="/step1"
        element={<FMVStep1 formData={formData} setFormData={setFormData} />}
      />
      <Route
        path="/step2"
        element={<FMVStep2 formData={formData} setFormData={setFormData} />}
      />
      {/* Uncomment below if you have a review step */}
      {/* <Route
        path="/review"
        element={<FMVReviewStep formData={formData} setFormData={setFormData} />}
      /> */}
    </Routes>
  );
}
