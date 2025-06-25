// frontend/src/pages/FMVReviewStep.jsx
import React from 'react';
import { useFMVContext } from '../context/FMVContext'; // CORRECTED import
import { Box, Button, Heading, Text, VStack, SimpleGrid, Divider } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReviewItem = ({ label, value }) => (
  <Box>
    <Text fontWeight="bold">{label}</Text>
    <Text>{Array.isArray(value) ? value.join(', ') : value}</Text>
  </Box>
);

const FMVReviewStep = () => {
  const { formData } = useFMVContext(); // CORRECTED hook name
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Logic for submitting the legacy form
      console.log("Submitting legacy FMV data:", formData);
      navigate('/fmv-result'); 
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading>Review Your Information</Heading>
      <Divider />
      {/* This is a simplified review for the legacy component */}
      <SimpleGrid columns={2} spacing={5}>
        <ReviewItem label="Name" value={formData.name} />
        <ReviewItem label="Email" value={formData.email} />
        <ReviewItem label="School" value={formData.school} />
        <ReviewItem label="Sport" value={formData.sport?.join(', ')} />
      </SimpleGrid>
      <Button colorScheme="blue" onClick={handleSubmit}>Submit for FMV Estimate</Button>
    </VStack>
  );
};

export default FMVReviewStep;