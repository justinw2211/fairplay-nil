// frontend/src/pages/Home.jsx
import React from 'react';
import { Box, Button, Flex, Heading, Text, VStack, SimpleGrid, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
// *** BUG FIX: All imports related to the old FMVContext have been REMOVED. ***
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';

const Feature = ({ title, text }) => {
  return (
    <VStack align="start" spacing={3}>
      <Flex align="center">
        <Icon as={CheckCircleIcon} color="brand.accentPrimary" w={5} h={5} />
        <Text fontWeight="bold" ml={2}>{title}</Text>
      </Flex>
      <Text color="brand.textSecondary">{text}</Text>
    </VStack>
  );
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Flex
        align="center"
        justify="center"
        h="80vh"
        bg="brand.background"
        textAlign="center"
        px={6}
      >
        <VStack spacing={6}>
          <Heading as="h1" size="2xl" fontWeight="extrabold" color="brand.textPrimary">
            Navigate Your NIL Deals with Confidence
          </Heading>
          <Text fontSize="xl" maxW="3xl" color="brand.textSecondary">
            FairPlay NIL provides student-athletes with the tools and transparency needed to manage their Name, Image, and Likeness opportunities securely and efficiently.
          </Text>
          <Button
            size="lg"
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            rightIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/signup')}
            _hover={{ bg: '#c8aeb0' }}
          >
            Get Started for Free
          </Button>
        </VStack>
      </Flex>

      {/* Features Section */}
      <Box p={{ base: 8, md: 16 }} bg="brand.backgroundLight">
        <VStack spacing={12}>
          <Heading as="h2" size="xl" textAlign="center">A Platform Built for You</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} maxW="container.lg">
            <Feature
              title="Secure Deal Management"
              text="Submit, track, and manage all your NIL deals in one secure, centralized dashboard."
            />
            <Feature
              title="Compliance Simplified"
              text="Our automated checks help you understand potential compliance issues before you sign."
            />
            <Feature
              title="Transparent Valuations"
              text="Gain insights into your Fair Market Value to ensure you're compensated fairly for your influence."
            />
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;