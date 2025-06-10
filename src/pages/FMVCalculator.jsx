// This file stays in `pages` as it's a main entry point.
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FMVStep1 from '../components/calculator/FMVStep1';
import FMVStep2 from '../components/calculator/FMVStep2';
import FMVReviewStep from '../components/calculator/FMVReviewStep';

export default function FMVCalculator() {
  const navigate = useNavigate();
  const goToStep1 = () => navigate('/fmvcalculator');
  const goToStep2 = () => navigate('/fmvcalculator/step2');
  const goToReview = () => navigate('/fmvcalculator/review');

  return (
    <Routes>
      <Route path="/" element={<FMVStep1 onNext={goToStep2} />} />
      <Route
        path="/step2"
        element={<FMVStep2 onBack={goToStep1} onNext={goToReview} />}
      />
      <Route
        path="/review"
        element={<FMVReviewStep onBack={goToStep2} />}
      />
    </Routes>
  );
}