import React from 'react';
import { useFMV } from '../../../context/FMVContext';
import { useMutation } from '@tanstack/react-query';
import { calculateFmv } from '../../services/api';
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast, Divider, Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function FMVReviewStep({ onBack }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData } = useFMV();

  const mutation = useMutation({
    mutationFn: calculateFmv,
    onSuccess: (response) => {
      const finalFormData = { ...formData, fmv: response.data.fmv };
      updateFormData(finalFormData);
      localStorage.setItem('fmvFormData', JSON.stringify(finalFormData));
      navigate('/result', { state: { formData: finalFormData } });
    },
    onError: (error) => {
      toast({
        title: 'An error occurred.',
        description: error.response?.data?.detail || 'Could not calculate FMV.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    // We can expand this payload creation later if needed
    mutation.mutate(formData);
  };
  
  return (
    <Flex minH="100vh" align="center" justify="center" p={4}>
      <Stack
        spacing={6}
        w="full"
        maxW="2xl"
        bg="brand.secondary"
        p={{ base: 6, md: 8 }}
        borderRadius="xl"
        shadow="lg"
      >
        <Heading as="h1" size="lg">Review & Confirm</Heading>
        <Text>Please review your responses below.</Text>
        
        {mutation.isError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {mutation.error.message}
          </Alert>
        )}

        {/* ... Review details here ... */}

        <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline">Back</Button>
            <Button 
              colorScheme="blue" // Use a different color for the final action
              onClick={handleSubmit} 
              isLoading={mutation.isPending}
              loadingText="Calculating..."
            >
              Calculate FMV
            </Button>
        </Flex>
      </Stack>
    </Flex>
  );