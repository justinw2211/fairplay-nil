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
  useDisclosure,
  Grid,
  Link,
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
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

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
      title: "Athlete & Analytics Dashboard",
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

  const { user } = useAuth();

  return (
    <Box bg="brand.backgroundLight" minH="100vh">
      {/* Hero */}
      <Box bg="brand.background" color="brand.textPrimary" py={20}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Text fontSize="sm" bg="brand.accentSecondary" color="brand.textSecondary" px={3} py={1} borderRadius="full">
              Trusted by Leading Athletic Programs
            </Text>
            <Heading as="h1" size="2xl" fontWeight="extrabold" lineHeight="1.2">
              A Single Platform for <Box as="span" color="brand.accentPrimary">University NIL Operations</Box>
            </Heading>
            <Text fontSize="lg" maxW="3xl" color="brand.textSecondary">
              Manage NIL disclosures, track deal workflows, and access program-wide insights — all in one comprehensive platform designed for athletic departments.
            </Text>
            <HStack spacing={4} pt={2}>
              <Button 
                size="lg" 
                px={8} 
                bg="brand.accentPrimary" 
                color="white"
                _hover={{ bg: "#c9b2a9" }}
                onClick={handleCtaClick}
              >
                Schedule a Demo
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Capabilities */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading as="h2" size="xl" color="brand.textPrimary">
              Capabilities Built for Athletic Departments
            </Heading>
            <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
              Consolidate NIL workflows across compliance, deal management, valuation guidance, and reporting.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {tools.map((tool, index) => (
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
      <Box bg="brand.backgroundLight" py={16}>
        <Container maxW="7xl">
        <VStack spacing={10} align="stretch">
          <Grid
            templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 420px" }}
            gap={6}
            alignItems="start"
          >
            {/* Left: Outcomes content */}
            <VStack align="start" spacing={4}>
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Outcomes for Your Program
              </Heading>
              <VStack align="start" spacing={3}>
                {[
                  "Increase visibility into NIL activity across teams and sports programs",
                  "Consolidate submissions, approvals, and documentation workflows",
                  "Equip staff with dashboards and exports for comprehensive oversight",
                  "Integrate data with existing systems as needed for operational efficiency",
                ].map((benefit, index) => (
                  <HStack key={index} spacing={3}>
                    <Icon as={FiMonitor} color="brand.accentPrimary" />
                    <Text color="brand.textSecondary">{benefit}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            {/* Right: CTA card */}
            <Box
              bg="white"
              shadow="sm"
              border="1px solid"
              borderColor="brand.accentSecondary"
              borderRadius="lg"
              p={5}
              position={{ lg: "sticky" }}
              top={{ lg: "80px" }}
            >
              <VStack align="start" spacing={4}>
                <Heading as="h3" size="md" color="brand.textPrimary">
                  Schedule a Demo
                </Heading>
                <Text color="brand.textSecondary">
                  See how FairPlay NIL can streamline compliance, deal workflows, and reporting.
                </Text>
                <Button 
                  size="md" 
                  bg="brand.accentPrimary" 
                  color="white"
                  _hover={{ bg: "#c9b2a9" }}
                  onClick={handleCtaClick} 
                  alignSelf="stretch"
                >
                  Schedule a Demo
                </Button>
                <Text fontSize="sm" color="brand.textSecondary">30-minute personalized walkthrough</Text>
              </VStack>
            </Box>
          </Grid>

          {/* Program highlights grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={10}>
            {[
              { icon: FiDatabase, label: "Secure Storage", desc: "Enterprise-grade security for NIL documentation and sensitive data" },
              { icon: FiMonitor, label: "Operational Visibility", desc: "Real-time insights into NIL activities across your program" },
              { icon: FiUsers, label: "Stakeholder Access", desc: "Role-based permissions for coaches, compliance, and admins" },
              { icon: FiBarChart, label: "Dashboards & Exports", desc: "Comprehensive reporting tools and export capabilities" },
            ].map((item, index) => (
              <VStack key={index} spacing={3} textAlign="center">
                <Flex align="center" justify="center" w={16} h={16} bg="brand.background" borderRadius="full" border="1px solid" borderColor="brand.accentSecondary">
                  <Icon as={item.icon} w={8} h={8} color="brand.accentPrimary" />
                </Flex>
                <Text fontWeight="semibold" color="brand.textPrimary">{item.label}</Text>
                <Text fontSize="sm" color="brand.textSecondary" maxW="56">{item.desc}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
        </Container>
      </Box>

      {!user && <Footer />}
      <UniversitiesDemoModal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmitModal} />
    </Box>
  );
};

export default Universities;
