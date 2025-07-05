import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi';
import DealTypeCard from '../components/DealTypeCard';
import { useDeal } from '../context/DealContext';

const DealTypeSelection = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { createDraftDeal, loading: isCreatingDeal } = useDeal();

  const handleDealTypeSelect = async (dealType) => {
    try {
      const newDeal = await createDraftDeal({ deal_type: dealType });
      if (!newDeal) {
        throw new Error('Failed to create new deal');
      }
      
      // Navigate to the appropriate workflow based on deal type
      switch (dealType) {
        case 'simple':
          navigate(`/deal-wizard/simple-social-media/${newDeal.id}`);
          break;
        case 'clearinghouse':
          navigate(`/deal-wizard/clearinghouse-social-media/${newDeal.id}`);
          break;
        case 'valuation':
          navigate(`/deal-wizard/valuation-social-media/${newDeal.id}`);
          break;
        default:
          navigate(`/deal-wizard/social-media/${newDeal.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error Creating Deal',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const dealTypes = [
    {
      id: 'simple',
      title: 'Simple Deal Logging',
      description: 'Basic deal tracking without predictive analysis. Perfect for straightforward deals where you just need status management.',
      icon: FiFileText
    },
    {
      id: 'clearinghouse',
      title: 'NIL Go Clearinghouse Check',
      description: 'Get a prediction on whether your deal will be approved, denied, or flagged by the NIL Go Clearinghouse.',
      icon: FiShield
    },
    {
      id: 'valuation',
      title: 'Deal Valuation Analysis',
      description: 'Receive fair market value compensation ranges based on your deal parameters and athlete profile.',
      icon: FiTrendingUp
    }
  ];

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={8} align="center" mb={10}>
        <Heading as="h1" size="xl" textAlign="center" color="brand.textPrimary">
          Choose Your Deal Type
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.600" maxW="600px">
          Select the type of deal analysis you'd like to perform. Each option provides different insights to help you make informed decisions.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} justifyItems="center">
        {dealTypes.map((dealType) => (
          <DealTypeCard
            key={dealType.id}
            title={dealType.title}
            description={dealType.description}
            icon={dealType.icon}
            onClick={() => handleDealTypeSelect(dealType.id)}
            isLoading={isCreatingDeal}
          />
        ))}
      </SimpleGrid>

      <Flex justify="center" mt={10}>
        <Text fontSize="sm" color="gray.500" textAlign="center" maxW="500px">
          Don't worry, you can always change your approach later. Each deal type provides different insights to help you succeed.
        </Text>
      </Flex>
    </Box>
  );
};

export default DealTypeSelection; 