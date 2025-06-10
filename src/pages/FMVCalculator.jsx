import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import FMVStep1 from "./FMVStep1";
import FMVStep2 from "./FMVStep2";
import FMVReviewStep from "./FMVReviewStep";

// This component now acts as a simple router for the multi-step survey.
// Global state is handled by FMVContext.

export default function FMVCalculator() {
  const navigate = useNavigate();

  // Navigation functions are still useful to pass to steps
  const goToStep1 = () => navigate("/fmvcalculator/step1");
  const goToStep2 = () => navigate("/fmvcalculator/step2");
  const goToReview = () => navigate("/fmvcalculator/review");

  return (
    <Routes>
      <Route
        path="/step1"
        element={ <FMVStep1 onNext={goToStep2} /> }
      />
      <Route
        path="/step2"
        element={ <FMVStep2 onBack={goToStep1} onNext={goToReview} /> }
      />
      <Route
        path="/review"
        element={ <FMVReviewStep onBack={goToStep2} /> }
      />
      {/* Default/fallback: Start at step 1 */}
      <Route 
        path="*" 
        element={ <FMVStep1 onNext={goToStep2} /> }
      />
    </Routes>
  );
}
