import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import FMVStep1 from "./FMVStep1";
import FMVStep1_Academics from "./FMVStep1_Academics";
import FMVStep3 from "./FMVStep3"; // Renamed from FMVStep2
import FMVReviewStep from "./FMVReviewStep";

export default function FMVCalculator() {
  const navigate = useNavigate();

  const goToStep1 = () => navigate("/fmvcalculator/step1");
  const goToAcademics = () => navigate("/fmvcalculator/step2");
  const goToStep3 = () => navigate("/fmvcalculator/step3");
  const goToReview = () => navigate("/fmvcalculator/review");

  return (
    <Routes>
      <Route path="/step1" element={<FMVStep1 onNext={goToAcademics} />} />
      <Route path="/step2" element={<FMVStep1_Academics onBack={goToStep1} onNext={goToStep3} />} />
      <Route path="/step3" element={<FMVStep3 onBack={goToAcademics} onNext={goToReview} />} />
      <Route path="/review" element={<FMVReviewStep onBack={goToStep3} />} />
      {/* Default/fallback: Start at step 1 */}
      <Route path="*" element={<FMVStep1 onNext={goToAcademics} />} />
    </Routes>
  );
}