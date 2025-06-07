import React, { useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import FMVStep1 from "./FMVStep1";
import FMVStep2 from "./FMVStep2";
import FMVReviewStep from "./FMVReviewStep";
import FMVResult from "./FMVResult";
import { Box } from "@chakra-ui/react";

// You can expand this as needed!
const initialFormData = {
  division: "",
  school: "",
  name: "",
  email: "",
  gender: "",
  sport: "",
  graduation_year: "",
  age: "",
  gpa: "",
  prior_nil_deals: "",
  // Add deal-specific fields here
};

export default function FMVCalculator() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { path: "/fmvcalculator/step1", label: "Profile & Academics" },
    { path: "/fmvcalculator/step2", label: "Deal Details" },
    { path: "/fmvcalculator/review", label: "Review" },
    { path: "/fmvcalculator/result", label: "Result" },
  ];

  const currentStepIdx = steps.findIndex(step => step.path === location.pathname);

  const goToStep = (idx) => {
    if (idx >= 0 && idx < steps.length) navigate(steps[idx].path);
  };

  const handleNext = () => goToStep(currentStepIdx + 1);
  const handleBack = () => goToStep(currentStepIdx - 1);

  return (
    <Box bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" minH="100vh">
      <Routes>
        <Route
          path="/step1"
          element={
            <FMVStep1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              onNext={handleNext}
              onBack={handleBack}
            />
          }
        />
        <Route
          path="/step2"
          element={
            <FMVStep2
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              onNext={handleNext}
              onBack={handleBack}
            />
          }
        />
        <Route
          path="/review"
          element={
            <FMVReviewStep
              formData={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          }
        />
        <Route path="/result" element={<FMVResult />} />
      </Routes>
    </Box>
  );
}