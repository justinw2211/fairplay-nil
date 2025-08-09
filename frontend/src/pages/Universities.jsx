import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Icon,
  SimpleGrid,
  Grid,
  useDisclosure,
} from "@chakra-ui/react";
import UniversitiesDemoModal from "../components/UniversitiesDemoModal";
import { createLogger } from "../utils/logger";

const pageLogger = createLogger("UniversitiesPage");
import {
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiBarChart,
  FiFileText,
  FiDatabase,
  FiMonitor,
} from "react-icons/fi";

const Universities = () => {
  const tools = [
    {
      icon: FiTrendingUp,
      title: "NIL Deal Valuation",
      description: "Guidance on fair market value ranges to support transparent compensation.",
    },
    {
      icon: FiShield,
      title: "Compliance Monitoring",
      description: "Track NIL disclosures and activities with configurable alerts and review.",
    },
    {
      icon: FiBarChart,
      title: "Analytics Dashboard",
      description: "Program-level KPIs and trends to inform NIL strategy and oversight.",
    },
    {
      icon: FiUsers,
      title: "Athlete Management",
      description: "Centralized profiles and submissions to streamline administration.",
    },
    {
      icon: FiFileText,
      title: "Document Management",
      description: "Organize contracts, disclosures, and supporting documentation in one place.",
    },
    {
      icon: FiDatabase,
      title: "Integrations & API",
      description: "Connect with existing systems and enable data portability when needed.",
    },
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCtaClick = () => {
    pageLogger.info("cta_click", { page: "Universities" });
    onOpen();
  };

  const handleSubmitModal = async (payload) => {
    pageLogger.info("demo_submit", { page: "Universities", payload: { ...payload, message: '[REDACTED]' } });
  };

  return (
    <Box bg="brand.backgroundLight" minH="100vh">
      {/* Hero */}
      <Box bg="brand.textPrimary" color="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              A Single Platform for University NIL Operations
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="gray.200">
              Manage NIL disclosures, track deal workflows, and access program-wide insights — in one place.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button size="lg" px={8} onClick={handleCtaClick}>
                Schedule a Demo
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Capabilities */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading as="h2" size="xl" color="brand.textPrimary">
              Capabilities Built for Athletic Departments
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
              Consolidate NIL workflows across compliance, deal management, valuation guidance, and reporting.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {tools.map((tool, index) => (
              <Box key={index} bg="white" shadow="sm" borderRadius="lg" p={6} border="1px solid" borderColor="brand.accentSecondary">
                <VStack align="start" spacing={4}>
                  <Flex
                    align="center"
                    justify="center"
                    w={12}
                    h={12}
                    bg="brand.backgroundLight"
                    borderRadius="lg"
                  >
                    <Icon as={tool.icon} w={6} h={6} color="brand.accentPrimary" />
                  </Flex>
                  <Heading as="h3" size="md" color="brand.textPrimary">
                    {tool.title}
                  </Heading>
                  <Text color="brand.textSecondary" lineHeight="tall">
                    {tool.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Outcomes */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12} align="stretch">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="start">
            <VStack align="start" spacing={4}>
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Outcomes for Your Program
              </Heading>
              <VStack align="start" spacing={3}>
                {[ 
                  "Increase visibility into NIL activity across teams and sports.",
                  "Consolidate submissions, approvals, and documentation.",
                  "Equip staff with dashboards and exports for oversight.",
                  "Integrate data with existing systems as needed.",
                ].map((benefit, index) => (
                  <HStack key={index} spacing={3}>
                    <Icon as={FiMonitor} color="brand.accentPrimary" />
                    <Text color="brand.textSecondary">{benefit}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            {/* Side CTA panel to utilize horizontal space */}
            <Box bg="brand.backgroundLight" borderRadius="xl" boxShadow="md" p={0}>
              <VStack align="start" spacing={4} px={8} pb={8} pt={0}>
                <Heading as="h3" size="lg" color="brand.textPrimary" mt={0}>
                  See It in Action
                </Heading>
                <Text color="brand.textSecondary">
                  Schedule a live walkthrough of compliance tracking, deal workflows, and analytics.
                </Text>
                <Button size="lg" w="full" onClick={handleCtaClick}>
                  Schedule a Demo
                </Button>
                <Text fontSize="sm" color="brand.textSecondary">
                  We’ll follow up by email to coordinate a time that works for your team.
                </Text>
              </VStack>
            </Box>
          </Grid>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {[
              { icon: FiDatabase, label: "Secure Storage" },
              { icon: FiMonitor, label: "Operational Visibility" },
              { icon: FiUsers, label: "Stakeholder Access" },
              { icon: FiBarChart, label: "Dashboards & Exports" },
            ].map((item, index) => (
              <VStack key={index} spacing={3} textAlign="center">
                <Flex align="center" justify="center" w={16} h={16} bg="brand.backgroundLight" borderRadius="xl">
                  <Icon as={item.icon} w={8} h={8} color="brand.accentPrimary" />
                </Flex>
                <Text fontWeight="semibold" color="brand.textPrimary">{item.label}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/** Final CTA band removed per request to reduce redundancy **/}
      <UniversitiesDemoModal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmitModal} />
    </Box>
  );
};

export default Universities;
