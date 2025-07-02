import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCalculator, FiDollarSign, FiShield, FiTrendingUp } from "react-icons/fi";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      spacing={4}
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
    >
      <Icon as={icon} boxSize={6} color="brand.accentPrimary" />
      <Heading size="md" color="brand.textPrimary">
        {title}
      </Heading>
      <Text color="brand.textSecondary">
        {description}
      </Text>
    </VStack>
  );
};

export default function Athletes() {
  const features = [
    {
      icon: FiCalculator,
      title: "NIL Deal Calculator",
      description: "Get instant, accurate valuations for your NIL deals based on your sport, following, and engagement metrics."
    },
    {
      icon: FiDollarSign,
      title: "Market Rate Insights",
      description: "Access real-time market data to understand your worth and negotiate better deals with confidence."
    },
    {
      icon: FiShield,
      title: "Compliance Check",
      description: "Stay compliant with NCAA regulations while maximizing your earning potential through our built-in compliance tools."
    },
    {
      icon: FiTrendingUp,
      title: "Growth Analytics",
      description: "Track your NIL value growth over time and identify opportunities to increase your market value."
    }
  ];

  return (
    <Box bg="brand.backgroundLight" minH="100vh" py={12}>
      <Container maxW="7xl">
        {/* Hero Section */}
        <VStack spacing={6} align="start" mb={16}>
          <Heading 
            as="h1" 
            size="2xl" 
            color="brand.textPrimary"
            lineHeight="1.2"
          >
            Know Your Worth with Our
            <Box as="span" color="brand.accentPrimary" display="block">
              NIL Deal Calculator
            </Box>
          </Heading>
          <Text fontSize="xl" color="brand.textSecondary" maxW="2xl">
            Make informed decisions about your NIL opportunities with our advanced calculator.
            Get personalized valuations based on your unique athletic profile and market data.
          </Text>
          <Button
            size="lg"
            bg="brand.accentPrimary"
            color="white"
            _hover={{ bg: "#c9b2a9" }}
            mt={4}
          >
            Calculate Your Value
          </Button>
        </VStack>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={16}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </SimpleGrid>

        {/* How It Works Section */}
        <VStack spacing={8} align="start" bg="white" p={8} borderRadius="lg" boxShadow="sm">
          <Heading size="xl" color="brand.textPrimary">
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="brand.accentPrimary">
                1. Enter Your Details
              </Text>
              <Text color="brand.textSecondary">
                Input your sport, division, social media following, and other relevant metrics.
              </Text>
            </VStack>
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="brand.accentPrimary">
                2. Get Your Valuation
              </Text>
              <Text color="brand.textSecondary">
                Receive an instant calculation of your NIL market value based on current market data.
              </Text>
            </VStack>
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="brand.accentPrimary">
                3. Explore Opportunities
              </Text>
              <Text color="brand.textSecondary">
                Use your valuation to negotiate better deals and track your growth over time.
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}