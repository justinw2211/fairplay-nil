// frontend/src/pages/DealWizard/Step8_Review.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box, Button, Container, Flex, Heading, Text, Spinner, VStack,
  Divider, SimpleGrid, Tag, List, ListItem, ListIcon, useToast
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const ObligationDetails = ({ obligations }) => {
  if (!obligations || Object.keys(obligations).length === 0) {
    return <ListItem>No obligations specified.</ListItem>;
  }

  return Object.entries(obligations).map(([activity, details]) => {
    let detailText = "Details provided.";

    if (activity === 'Social Media' && Array.isArray(details)) {
      detailText = details.map(p => `${p.quantity} ${p.platform} post(s)`).join(', ');
    } else if (details.quantity || details.description) {
      detailText = `${details.quantity || ''} ${details.type || ''} - ${details.description || ''}`.replace(/^ - | - $/g, '');
    } else if (details.description) {
      detailText = details.description;
    }

    return (
      <ListItem key={activity}>
        <ListIcon as={CheckCircleIcon} color="green.500" />
        <Text as="span" fontWeight="bold">{activity}: </Text>
        <Text as="span">{detailText}</Text>
      </ListItem>
    );
  });
};

const Step8_Review = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { deal, fetchDealById } = useDeal();

  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!deal && dealId) {
      fetchDealById(dealId);
    }

    const timer = setTimeout(() => setFallback(true), 10000); // 10s timeout
    return () => clearTimeout(timer);
  }, [deal, dealId, fetchDealById]);

  if (!deal && !fallback) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!deal && fallback) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.600">We couldn’t load your deal. Please try again from the dashboard.</Text>
          <Button colorScheme="pink" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <Container maxW="3xl" py={10}>
      <Heading as="h2" size="xl" mb={6}>Review & Confirm</Heading>

      <VStack align="start" spacing={5}>
        <Box>
          <Heading size="md" mb={2}>Deal Summary</Heading>
          <Text><strong>School:</strong> {deal.school}</Text>
          <Text><strong>Sport:</strong> {deal.sport}</Text>
          <Text><strong>Compensation:</strong> ${deal.compensation_amount}</Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={2}>Obligations</Heading>
          <List spacing={3}>
            <ObligationDetails obligations={deal.obligations} />
          </List>
        </Box>

        <Divider />

        <Button
          colorScheme="green"
          onClick={() => navigate(`/add/deal/confirmation/success/${dealId}`)}
        >
          Submit for Review
        </Button>
      </VStack>
    </Container>
  );
};

export default Step8_Review;
