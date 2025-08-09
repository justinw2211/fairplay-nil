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
      <Box bg="brand.textPrimary" color="white" py={16}>
        <Container maxW="7xl">
          <VStack spacing={5} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              A Single Platform for University NIL Operations
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="gray.200">
              Manage NIL disclosures, track deal workflows, and access program-wide insights — in one place.
            </Text>
            <HStack spacing={4} pt={2}>
              <Button size="lg" px={8} onClick={handleCtaClick}>
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

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {tools.map((tool, index) => (
              <Box key={index} bg="white" shadow="sm" borderRadius="lg" p={5} border="1px solid" borderColor="brand.accentSecondary">
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
      <Container maxW="7xl" py={16}>
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
                <Button size="md" onClick={handleCtaClick} alignSelf="stretch">
                  Schedule a Demo
                </Button>
              </VStack>
            </Box>
          </Grid>

          {/* Program highlights grid */}
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

      {/* Footer (from Home page) */}
      <Box bg="brand.backgroundLight" py={12}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={8}>
            {/* Logo */}
            <VStack align="start">
              <Link href="/" fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                FairPlay NIL
              </Link>
            </VStack>

            {/* Product */}
            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>
                Product
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="/athletes" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Athletes
                </Link>
                <Link href="/brands" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Brands
                </Link>
              </VStack>
            </VStack>

            {/* Company */}
            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>
                Company
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="/about" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  About Us
                </Link>
                <Link href="/careers" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Careers
                </Link>
                <Link href="/blog" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Blogs
                </Link>
              </VStack>
            </VStack>

            {/* Legal */}
            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>
                Legal
              </Heading>
              <VStack align="start" spacing={2}>
                <Link href="/privacy" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                  Terms of Service
                </Link>
              </VStack>
            </VStack>
          </Grid>

          {/* Social Media Icons */}
          <HStack justify="center" spacing={6} mt={8} pt={8} borderTop="1px" borderColor="gray.300">
            <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
              <Icon as={Twitter} boxSize={6} />
            </Link>
            <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
              <Icon as={Instagram} boxSize={6} />
            </Link>
            <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
              <Icon as={Linkedin} boxSize={6} />
            </Link>
          </HStack>
        </Container>
      </Box>
      <UniversitiesDemoModal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmitModal} />
    </Box>
  );
};

export default Universities;
