// src/pages/FMVCalculator.jsx
import React, { useState } from "react";
import FMVStep1 from "./FMVStep1";
import FMVStep2 from "./FMVStep2";
import FMVReviewStep from "./FMVReviewStep";
import { Box, Progress, Button } from "@chakra-ui/react";

// Add more step components as needed here
const stepConfig = [
  {
    id: "profile",
    label: "Profile & Academics",
    component: FMVStep1,
  },
  {
    id: "deal",
    label: "Deal Info",
    component: FMVStep2,
  },
  {
    id: "review",
    label: "Review & Submit",
    component: FMVReviewStep,
  },
  // // Example for adding more steps:
  // {
  //   id: "yourNewStep",
  //   label: "New Step",
  //   component: YourNewStep,
  // },
];

// Helper for progress bar
const getProgress = (currentStepIdx, totalSteps) =>
  Math.round((currentStepIdx / (totalSteps - 1)) * 100);

const defaultFormData = {
  // all your form fields
  // e.g. name: "", gpa: "", school: "", ...etc
};

export default function FMVCalculator() {
  // State for which step is being shown
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // State for ALL survey answers (shared across steps)
  const [formData, setFormData] = useState(defaultFormData);

  // State for validation errors (object keyed by field name)
  const [errors, setErrors] = useState({});

  // --- NAVIGATION HANDLERS ---
  const nextStep = () => {
    if (currentStepIdx < stepConfig.length - 1) {
      setCurrentStepIdx((idx) => idx + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((idx) => idx - 1);
      setErrors({});
    }
  };

  // Allow review page to "jump" to any previous step (edit)
  const goToStep = (stepIdx) => {
    if (stepIdx >= 0 && stepIdx < stepConfig.length) {
      setCurrentStepIdx(stepIdx);
      setErrors({});
    }
  };

  // Step metadata for rendering
  const totalSteps = stepConfig.length;
  const StepComponent = stepConfig[currentStepIdx].component;
  const stepId = stepConfig[currentStepIdx].id;

  // --- DYNAMIC CONDITIONAL LOGIC STUBS ---
  // Example: You can insert logic here to change which steps to show based on formData
  // e.g., filter steps for D1/university, or reorder steps
  // For now, it's a static array

  // --- SHARED PROPS FOR STEP COMPONENTS ---
  const stepProps = {
    formData,
    setFormData,
    errors,
    setErrors,
    onNext: nextStep,
    onBack: prevStep,
    // for review page to jump to step
    goToStep,
    currentStepIdx,
    totalSteps,
    stepId,
  };

  return (
    <Box
      maxW="540px"
      mx="auto"
      mt={10}
      p={6}
      borderRadius="2xl"
      bg="gray.900"
      boxShadow="xl"
      color="white"
    >
      <Box mb={6}>
        <Progress
          value={getProgress(currentStepIdx, totalSteps)}
          size="sm"
          colorScheme="green"
          borderRadius="2xl"
          bg="gray.700"
        />
        <Box mt={2} textAlign="right" fontSize="sm" color="gray.400">
          Step {currentStepIdx + 1} of {totalSteps}:{" "}
          {stepConfig[currentStepIdx].label}
        </Box>
      </Box>

      <StepComponent {...stepProps} />

      <Box mt={8} display="flex" justifyContent="space-between">
        {currentStepIdx > 0 && (
          <Button variant="ghost" colorScheme="gray" onClick={prevStep}>
            Back
          </Button>
        )}
        {/* Empty div for alignment if needed */}
        <Box flex="1" />
      </Box>
    </Box>
  );
}
