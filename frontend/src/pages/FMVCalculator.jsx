// frontend/src/pages/FMVCalculator.jsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useFMVContext } from '../context/FMVContext'; // CORRECTED import
import FMVStep1 from './FMVStep1';
import FMVStep1_Academics from './FMVStep1_Academics';
import FMVStep3 from './FMVStep3';
import FMVReviewStep from './FMVReviewStep';
import { Box, Progress, Container, Heading } from '@chakra-ui/react';

const FMVCalculator = () => {
  const { formData, updateFormData } = useFMVContext(); // CORRECTED hook name

  const totalSteps = 4; // Example total steps

  // This component now acts as a layout/router for the old flow
  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Fair Market Value Calculator (Legacy)</Heading>
      <Box borderWidth="1px" borderRadius="lg" p={8}>
        <Routes>
          <Route path="step1" element={<FMVStep1 />} />
          <Route path="step1-academics" element={<FMVStep1_Academics />} />
          <Route path="step3" element={<FMVStep3 />} />
          <Route path="review" element={<FMVReviewStep />} />
        </Routes>
      </Box>
    </Container>
  );
};

export default FMVCalculator;