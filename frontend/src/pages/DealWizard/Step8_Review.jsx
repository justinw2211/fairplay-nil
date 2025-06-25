// frontend/src/pages/DealWizard/Step8_Review.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box, Button, Container, Flex, Heading, Text, Spinner, VStack, Divider, SimpleGrid, Tag, List, ListItem, ListIcon, useToast
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const ReviewItem = ({ label, children }) => (
  <Box>
    <Heading size="sm" color="gray.500" textTransform="uppercase" mb={1}>{label}</Heading>
    <Text fontSize="md" color="brand.textPrimary">{children || "Not provided"}</Text>
  </Box>
);

const Step8_Review = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal, loading } = useDeal();
  const toast = useToast();

  const handleSubmitDeal = async () => {
    if (!deal?.deal_terms_url) {
        toast({
            title: "Deal Terms Missing",
            description: "Please go back and upload a contract or other deal terms before submitting.",
            status: "error",
            duration: 7000,
            isClosable: true,
        });
        return;
    }
    
    // The final step is to update the status to 'Submitted'
    await updateDeal(dealId, { status: 'Submitted' });
    navigate(`/add/deal/success/${dealId}`);
  };

  if (loading || !deal) {
    return <Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>;
  }
  
  // Calculate total compensation for summary display
  const totalCompensation = (deal.compensation_cash || 0) + 
    (deal.compensation_goods || []).reduce((sum, item) => sum + (item.estimated_value || 0), 0) +
    (deal.compensation_other || []).reduce((sum, item) => sum + (item.estimated_value || 0), 0);

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="lg">Review Your Submission</Heading>
          <Text mt={2} color="brand.textSecondary">Please review all the details below before submitting your deal.</Text>
        </Box>

        <VStack p={8} borderWidth={1} borderRadius="lg" spacing={6} align="stretch" divider={<Divider />}>
          {/* Payor Info */}
          <Box>
            <Heading size="md" mb={4}>Payor Information</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <ReviewItem label="Payor Name">{deal.payor_name}</ReviewItem>
              <ReviewItem label="Contact Name">{deal.contact_name}</ReviewItem>
              <ReviewItem label="Contact Email">{deal.contact_email}</ReviewItem>
              <ReviewItem label="Contact Phone">{deal.contact_phone}</ReviewItem>
            </SimpleGrid>
          </Box>
          
          {/* Obligations */}
          <Box>
            <Heading size="md" mb={4}>Your Obligations</Heading>
            <List spacing={3}>
            {deal.obligations && Object.entries(deal.obligations).map(([key, value]) => (
                <ListItem key={key}>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    <Text as="span" fontWeight="bold">{key}: </Text>
                    {/* Add more detailed formatting here if needed in the future */}
                    <Text as="span">Details provided</Text>
                </ListItem>
            ))}
            </List>
          </Box>

          {/* Compensation */}
          <Box>
            <Heading size="md" mb={4}>Compensation Summary</Heading>
            <Text fontSize="2xl" fontWeight="bold" color="brand.accentPrimary">
                Total Estimated Value: ${totalCompensation.toFixed(2)}
            </Text>
          </Box>
          
          {/* Final Details */}
           <Box>
            <Heading size="md" mb={4}>Final Details</Heading>
            <VStack align="stretch">
                <Tag colorScheme={deal.is_paid_to_llc ? 'green' : 'gray'}>Paid to LLC: {deal.is_paid_to_llc ? 'Yes' : 'No'}</Tag>
                <Tag colorScheme={deal.is_group_deal ? 'green' : 'gray'}>Group Deal: {deal.is_group_deal ? 'Yes' : 'No'}</Tag>
                <Tag colorScheme={deal.deal_terms_url ? 'green' : 'red'}>Contract Uploaded: {deal.deal_terms_url ? 'Yes' : 'No'}</Tag>
            </VStack>
          </Box>
        </VStack>

        <Flex justify="flex-end" align="center">
          <Button
            size="lg"
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            onClick={handleSubmitDeal}
            isLoading={loading}
            isDisabled={!deal.deal_terms_url} // Disable if contract is missing
            _hover={{ bg: '#c8aeb0' }}
          >
            Submit Deal
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Step8_Review;