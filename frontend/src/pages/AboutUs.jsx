
import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiTrendingUp,
  FiShield,
  FiFileText,
  FiEye,
  FiHeart,
  FiZap,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import Footer from "../components/Footer";

const AboutUs = () => {
  const navigate = useNavigate();

  const platformFeatures = [
    {
      icon: FiTrendingUp,
      title: "Fair Market Value Estimation",
      description: "Transparent, evidence-based formulas benchmark what a deal is truly worth.",
    },
    {
      icon: FiShield,
      title: "Pre-Deal Compliance Checks",
      description: "Automated reviews ensure each contract aligns with NCAA, school, and state rules.",
    },
    {
      icon: FiFileText,
      title: "Deal Builder & Documentation",
      description: "Generate clean summaries that make compliance approval effortless.",
    },
  ];

  const values = [
    {
      icon: FiEye,
      title: "Transparency",
      description: "Every number and rule has context.",
    },
    {
      icon: FiHeart,
      title: "Integrity",
      description: "Fairness comes before flash.",
    },
    {
      icon: FiZap,
      title: "Innovation",
      description: "Data science meets real-world compliance.",
    },
    {
      icon: FiUsers,
      title: "Empowerment",
      description: "Athletes deserve the same clarity as institutions.",
    },
    {
      icon: FiCheckCircle,
      title: "Accountability",
      description: "Each deal should withstand scrutiny from both sides.",
    },
  ];

  return (
    <Box bg="brand.backgroundLight" minH="100vh">
      {/* Hero Section */}
      <Box bg="brand.background" color="brand.textPrimary" py={20}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Text fontSize="sm" bg="brand.accentSecondary" color="brand.textSecondary" px={3} py={1} borderRadius="full">
              Clarity Before Compliance
            </Text>
            <Heading as="h1" size="2xl" fontWeight="extrabold" lineHeight="1.2">
              FairPlay NIL helps athletes, universities, and collectives navigate NIL dealmaking with <Box as="span" color="brand.accentPrimary">transparency, precision, and confidence</Box>
            </Heading>
            <Text fontSize="lg" maxW="3xl" color="brand.textSecondary">
              To give every student-athlete a fair, data-backed understanding of their NIL value — before they sign anything.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Our Story */}
      <Container maxW="6xl" py={16}>
        <VStack spacing={8} align="start">
          <VStack spacing={4} align="start">
            <Heading as="h2" size="xl" color="brand.textPrimary">
              Our Story
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" lineHeight="tall">
              FairPlay NIL began with one athlete's experience trying to structure NIL deals that were fair for both sides.
              As a Division I runner at the University of Virginia, I saw how many athletes sell themselves short simply because information about deal value sits inside a black box. That gap inspired me to build something different — a tool that puts reliable data and clear standards in every athlete's hands.
            </Text>
            <Text fontSize="lg" color="brand.textSecondary" lineHeight="tall">
              Encouraged by mentors in NIL compliance and data science, I combined what I learned as a finance and IT student, a McKinsey business analyst, and a competitor on the track into a simple goal: <Text as="span" fontWeight="bold" color="brand.textPrimary">bring fairness and clarity to NIL.</Text>
            </Text>
          </VStack>
        </VStack>
      </Container>

      {/* The Platform */}
      <Box bg="brand.background" py={16}>
        <Container maxW="7xl">
          <VStack spacing={8}>
            <VStack spacing={3} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                The Platform
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                FairPlay NIL provides a secure, easy-to-use environment for transparent NIL dealmaking.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {platformFeatures.map((feature, index) => (
                <Box
                  key={index}
                  bg="white"
                  borderRadius="lg"
                  p={6}
                  border="1px solid"
                  borderColor="brand.accentSecondary"
                  boxShadow="sm"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  <VStack align="start" spacing={4}>
                    <Flex align="center" justify="center" w={12} h={12} bg="brand.backgroundLight" borderRadius="lg">
                      <Icon as={feature.icon} w={6} h={6} color="brand.accentPrimary" />
                    </Flex>
                    <Heading as="h3" size="md" color="brand.textPrimary">
                      {feature.title}
                    </Heading>
                    <Text color="brand.textSecondary" lineHeight="tall">
                      {feature.description}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            <Text fontSize="md" color="brand.textSecondary" textAlign="center" maxW="4xl" mt={4}>
              Unlike traditional NIL tools that focus mainly on contract storage or marketing, FairPlay NIL is built around <Text as="span" fontWeight="bold" color="brand.textPrimary">valuation logic and compliance clarity.</Text> Every feature centers on fairness — giving both athletes and institutions a shared baseline for what "reasonable value" really means.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Our Values */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading as="h2" size="xl" color="brand.textPrimary">
              Our Values
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {values.map((value, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="lg"
                p={6}
                border="1px solid"
                borderColor="brand.accentSecondary"
                boxShadow="sm"
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Flex align="center" justify="center" w={12} h={12} bg="brand.backgroundLight" borderRadius="lg">
                    <Icon as={value.icon} w={6} h={6} color="brand.accentPrimary" />
                  </Flex>
                  <Heading as="h3" size="md" color="brand.textPrimary">
                    {value.title}
                  </Heading>
                  <Text color="brand.textSecondary" lineHeight="tall">
                    {value.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Why It Matters */}
      <Box bg="brand.backgroundLight" py={16}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading as="h2" size="xl" color="brand.textPrimary">
              Why It Matters
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" lineHeight="tall" maxW="4xl">
              The NIL era has opened unprecedented opportunities — and new risks.
              With evolving compliance expectations and settlements reshaping the landscape, schools and athletes need clear, defensible standards for value.
              FairPlay NIL bridges that gap, turning complex rules into actionable insight so that fairness isn't just an aspiration — it's the default.
            </Text>
            <Text fontSize="md" color="brand.textSecondary" maxW="3xl">
              Our methodology draws inspiration from frameworks like <Text as="span" fontWeight="bold" color="brand.textPrimary">Deloitte's NIL-Go</Text> and adapts to emerging standards shaped by <Text as="span" fontWeight="bold" color="brand.textPrimary">House v. NCAA</Text> and related compliance guidance.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Join Us CTA */}
      <Box bg="brand.background" py={16}>
        <Container maxW="4xl">
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Join Us
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="2xl">
                Ready to bring clarity to your NIL program?
              </Text>
            </VStack>
            <HStack spacing={6} pt={4}>
              <Button 
                size="lg" 
                px={8} 
                bg="brand.accentPrimary" 
                color="white"
                _hover={{ bg: "#c9b2a9" }}
                onClick={() => navigate('/dashboard')}
              >
                Estimate FMV Now
              </Button>
              <Button 
                size="lg" 
                px={8} 
                variant="outline"
                borderColor="brand.accentSecondary"
                color="brand.textSecondary"
                _hover={{ bg: "brand.backgroundLight" }}
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default AboutUs;
