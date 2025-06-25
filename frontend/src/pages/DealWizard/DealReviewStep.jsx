// frontend/src/pages/DealWizard/DealReviewStep.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFMVContext } from '../../context/FMVContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient'; // Direct import for API call
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Divider,
  Flex,
  Spacer,
  useToast
} from '@chakra-ui/react';

const ReviewItem = ({ label, value }) => (
  <Box>
    <Text fontSize="sm" color="brand.textSecondary">{label}</Text>
    <Text fontWeight="medium" color="brand.textPrimary">
      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'Not Provided')}
    </Text>
  </Box>
);

const DealReviewStep = () => {
  const navigate = useNavigate();
  const { formData } = useFMVContext();
  const { user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDeal = async () => {
    setIsSubmitting(true);
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    // The backend now expects all the new fields
    // We can clean up the formData here to match the DealCreate schema
    const payload = {
      // Step 1
      payor_name: formData.payor_name,
      payor_industry: formData.payor_industry,
      deal_description: formData.deal_description,
      payor_relationship_details: formData.payor_relationship_details,
      
      // Step 2
      compensation_type: formData.compensation_type,
      compensation_amount: parseFloat(formData.compensation_amount) || null,
      compensation_in_kind_description: formData.compensation_in_kind_description,
      
      // Step 3
      uses_school_ip: formData.uses_school_ip,
      // 'has_conflicts' could be added here if needed by backend
      
      // Step 4
      has_written_contract: formData.has_written_contract,
      agent_name: formData.agent_name,
      agent_agency: formData.agent_agency,
      contract_url: formData.contract_url,

      // Also include legacy fields if they are still relevant
      // Or map new fields to them
      brand_name: formData.payor_name, // Mapping
      industry: formData.payor_industry, // Mapping
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'An unknown error occurred.');
      }
      
      // On success, navigate to the result page with the response data
      navigate('/dashboard/new-deal/result', { state: { result } });

    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg" color="brand.textPrimary">Review Your Deal</Heading>
        <Text color="brand.textSecondary">Please review all information for accuracy before submitting.</Text>
        <Divider />

        <Heading as="h3" size="md" color="brand.textPrimary" mt={4}>The Basics</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ReviewItem label="Payor Name" value={formData.payor_name} />
            <ReviewItem label="Payor Industry" value={formData.payor_industry} />
            <ReviewItem label="Deal Description" value={formData.deal_description} />
            <ReviewItem label="Relationship with Payor" value={formData.payor_relationship_details} />
        </SimpleGrid>
        <Divider />

        <Heading as="h3" size="md" color="brand.textPrimary" mt={4}>Compensation</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ReviewItem label="Compensation Type" value={formData.compensation_type} />
            <ReviewItem label="Cash Amount" value={formData.compensation_amount ? `$${formData.compensation_amount}`: null} />
            <ReviewItem label="In-Kind Goods/Services" value={formData.compensation_in_kind_description} />
        </SimpleGrid>
        <Divider />
        
        <Heading as="h3" size="md" color="brand.textPrimary" mt={4}>The Rules & Agreement</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ReviewItem label="Uses School IP?" value={formData.uses_school_ip} />
            <ReviewItem label="Has Written Contract?" value={formData.has_written_contract} />
            <ReviewItem label="Using an Agent?" value={formData.is_using_agent} />
            <ReviewItem label="Agent Name" value={formData.agent_name} />
            <ReviewItem label="Contract Uploaded" value={formData.contract_url ? 'Yes' : 'No'} />
        </SimpleGrid>
        
        <Flex mt={8}>
            <Button variant="outline" onClick={() => navigate('/dashboard/new-deal/step-4')}>
                Previous Step
            </Button>
            <Spacer />
            <Button
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                isLoading={isSubmitting}
                onClick={handleSubmitDeal}
                _hover={{ bg: '#c8aeb0' }}
            >
                Submit for Compliance Check
            </Button>
        </Flex>
    </VStack>
  );
};

export default DealReviewStep;