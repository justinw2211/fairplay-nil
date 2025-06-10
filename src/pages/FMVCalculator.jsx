import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import FMVStep1 from "./FMVStep1";
import FMVStep2 from "./FMVStep2";
import FMVReviewStep from "./FMVReviewStep";
import FMVResult from "./FMVResult";

// This is the robust parent component for the multi-step survey.
// It manages global state and all navigation between survey steps.

export default function FMVCalculator() {
  const navigate = useNavigate();

  // The unified form data state. 
  // All steps update this object (it persists across all pages in the flow).
  const [formData, setFormData] = useState(() => {
    // Try to recover saved profile from localStorage on refresh/resume
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("fpn_profile") || "{}");
    } catch { }
    return saved || {};
  });

  // Helper functions to update state and optionally persist to localStorage.
  const updateFormData = (newFields) => {
    setFormData(prev => {
      const next = { ...prev, ...newFields };
      localStorage.setItem("fpn_profile", JSON.stringify(next));
      return next;
    });
  };

  // Step navigation helpers (for all steps to use)
  const goToStep1 = () => navigate("/fmvcalculator/step1");
  const goToStep2 = () => navigate("/fmvcalculator/step2");
  const goToReview = () => navigate("/fmvcalculator/review");
  // BUG FIX: The final navigation is now handled in FMVReviewStep directly to the top-level `/result` route.
  // The goToResult function is no longer needed here.

  // Render each step as a sub-route under /fmvcalculator/*
  return (
    <Routes>
      <Route
        path="/step1"
        element={
          <FMVStep1
            formData={formData}
            setFormData={updateFormData}
            onNext={goToStep2}
          />
        }
      />
      <Route
        path="/step2"
        element={
          <FMVStep2
            formData={formData}
            setFormData={updateFormData}
            onBack={goToStep1}
            onNext={goToReview}
          />
        }
      />
      <Route
        path="/review"
        element={
          <FMVReviewStep
            formData={formData}
            setFormData={updateFormData}
            onBack={goToStep2}
            // BUG FIX: The 'onNext' prop is removed as it was unused and the logic is handled within the component.
          />
        }
      />
      {/* BUG FIX: The redundant nested route for `/result` has been removed.
        The top-level router in `App.jsx` now handles this path. 
      */}

      {/* Default/fallback: Start at step 1 */}
      <Route path="*" element={<FMVStep1 formData={formData} setFormData={updateFormData} onNext={goToStep2} />} />
    </Routes>
  );
}
