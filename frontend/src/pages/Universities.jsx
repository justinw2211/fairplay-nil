import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  List,
  ListItem,
  ListIcon,
  Flex,
  Icon,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiBarChart,
  FiFileText,
  FiDollarSign,
  FiAward,
  FiDatabase,
  FiMonitor,
} from "react-icons/fi";

const Universities = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = "#d0bdb5";
  const accentSecondary = "#d6dce4";
  const primaryColor = "#282f3d";

  const handleCtaClick = () => {
    try {
      window.location.href = "/contact";
    } catch (error) {
      // no-op
    }
  };

  const packages = [
    {
      name: "Essential",
      price: "$2,499",
      period: "/month",
      description: "Perfect for smaller athletic programs getting started with NIL compliance",
      features: [
        "Basic NIL deal tracking",
        "Compliance monitoring",
        "Student-athlete portal",
        "Basic reporting dashboard",
        "Email support",
        "Up to 100 active deals",
      ],
      badge: "Most Popular",
      badgeColor: "brand",
    },
    {
      name: "Professional",
      price: "$4,999",
      period: "/month",
      description: "Comprehensive solution for mid-to-large athletic programs",
      features: [
        "Advanced deal valuation tools",
        "Real-time compliance alerts",
        "Custom reporting & analytics",
        "Brand partnership marketplace",
        "Priority phone support",
        "Up to 500 active deals",
        "Integration with existing systems",
        "Training & onboarding",
      ],
      badge: "Recommended",
      badgeColor: "brand",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Full-scale solution for Power 5 conferences and large universities",
      features: [
        "Unlimited deal tracking",
        "AI-powered valuation engine",
        "Custom compliance workflows",
        "White-label platform options",
        "Dedicated account manager",
        "24/7 premium support",
        "API access & integrations",
        "Conference-wide analytics",
        "Custom feature development",
      ],
      badge: "Enterprise",
      badgeColor: "brand",
    },
  ];

  const tools = [
    {
      icon: FiTrendingUp,
      title: "NIL Deal Valuation",
      description: "AI-powered algorithms that accurately assess the fair market value of NIL opportunities"
    },
    {
      icon: FiShield,
      title: "Compliance Monitoring",
      description: "Real-time tracking and alerts to ensure all deals meet NCAA and state regulations"
    },
    {
      icon: FiBarChart,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into your program's NIL activity and market trends"
    },
    {
      icon: FiUsers,
      title: "Athlete Management",
      description: "Centralized platform for managing student-athlete profiles and opportunities"
    },
    {
      icon: FiFileText,
      title: "Document Management",
      description: "Secure storage and organization of contracts, disclosures, and compliance documents"
    },
    {
      icon: FiDollarSign,
      title: "Financial Tracking",
      description: "Monitor compensation, tax implications, and financial reporting requirements"
    },
  ];

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box bg={primaryColor} color="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              NIL Management Solutions for Universities
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="gray.200">
              Comprehensive valuation tools and management software to help your athletic program
              navigate the NIL landscape with confidence, compliance, and strategic insight.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                bg={accentColor}
                color="white"
                _hover={{ bg: "#c8aeb0" }}
                px={8}
              >
                Schedule a Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.100" }}
                px={8}
              >
                View Pricing
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Tools & Features Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading as="h2" size="xl" color={primaryColor}>
              Powerful Tools for Modern Athletic Programs
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="3xl">
              Our comprehensive platform provides everything you need to manage NIL deals effectively,
              ensure compliance, and maximize opportunities for your student-athletes.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {tools.map((tool, index) => (
              <Card key={index} bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    <Flex
                      align="center"
                      justify="center"
                      w={12}
                      h={12}
                      bg={`${accentColor}20`}
                      borderRadius="lg"
                    >
                      <Icon as={tool.icon} w={6} h={6} color={accentColor} />
                    </Flex>
                    <Heading as="h3" size="md" color={primaryColor}>
                      {tool.title}
                    </Heading>
                    <Text color="gray.600" lineHeight="tall">
                      {tool.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Outcomes */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12} align="stretch">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={10} alignItems="center">
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

            {/* See It in Action — Side Callout */}
            <Box
              role="region"
              aria-labelledby="see-it-in-action"
              bg="brand.background"
              border="1px solid"
              borderColor="brand.accentSecondary"
              borderTopWidth="6px"
              borderTopColor="brand.accentPrimary"
              borderRadius="xl"
              boxShadow="sm"
              p={{ base: 6, md: 8 }}
            >
              <VStack align="start" spacing={4} w="full">
                <Heading id="see-it-in-action" as="h3" size="lg" color="brand.textPrimary">
                  See It in Action
                </Heading>
                <Text color="brand.textSecondary">
                  Get a live walkthrough of compliance tracking, deal workflows, and analytics tailored to your program.
                </Text>
                <Button size="lg" w="full" onClick={handleCtaClick}>
                  Schedule a Demo
                </Button>
                <HStack spacing={6} color="brand.textSecondary" fontSize="sm">
                  <Text>No obligation</Text>
                  <Text>15–30 minutes</Text>
                </HStack>
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Container>

      {/* Benefits Section */}
      <Container maxW="7xl" py={20}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
          <VStack align="start" spacing={6}>
            <Heading as="h2" size="xl" color={primaryColor}>
              Why Universities Choose FairPlay NIL
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Our platform has been trusted by over 200+ athletic programs nationwide to manage
              their NIL operations effectively while maintaining compliance and maximizing opportunities.
            </Text>

            <VStack align="start" spacing={4} w="full">
              {[
                "Reduce compliance risks by 95%",
                "Increase NIL deal transparency",
                "Streamline administrative processes",
                "Provide better athlete support",
                "Generate actionable insights",
              ].map((benefit, index) => (
                <HStack key={index} spacing={3}>
                  <Icon as={FiAward} color={accentColor} />
                  <Text color="gray.700">{benefit}</Text>
                </HStack>
              ))}
            </VStack>

            <Button
              size="lg"
              bg={accentColor}
              color="white"
              _hover={{ bg: "#c8aeb0" }}
              px={8}
            >
              Schedule Your Demo Today
            </Button>
          </VStack>

          <Box>
            <SimpleGrid columns={2} spacing={6}>
              {[
                { icon: FiDatabase, label: "Secure Data Storage", desc: "Bank-level security" },
                { icon: FiMonitor, label: "Real-time Monitoring", desc: "24/7 compliance tracking" },
                { icon: FiUsers, label: "Expert Support", desc: "Dedicated success team" },
                { icon: FiBarChart, label: "Advanced Analytics", desc: "Actionable insights" },
              ].map((item, index) => (
                <VStack key={index} spacing={3} textAlign="center">
                  <Flex
                    align="center"
                    justify="center"
                    w={16}
                    h={16}
                    bg={`${accentColor}20`}
                    borderRadius="xl"
                  >
                    <Icon as={item.icon} w={8} h={8} color={accentColor} />
                  </Flex>
                  <VStack spacing={1}>
                    <Text fontWeight="semibold" color={primaryColor}>
                      {item.label}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {item.desc}
                    </Text>
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>
        </Grid>
      </Container>

      {/* Footer (same structure as Home) */}
      <Box bg="brand.backgroundLight" py={12}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
            <VStack align="start">
              <Text as="a" href="/" fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                FairPlay NIL
              </Text>
            </VStack>

            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>Product</Heading>
              <VStack align="start" spacing={2}>
                <Text as="a" href="/athletes" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Athletes</Text>
                <Text as="a" href="/brands" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Brands</Text>
              </VStack>
            </VStack>

            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>Company</Heading>
              <VStack align="start" spacing={2}>
                <Text as="a" href="/about" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>About Us</Text>
                <Text as="a" href="/careers" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Careers</Text>
                <Text as="a" href="/blog" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Blogs</Text>
              </VStack>
            </VStack>

            <VStack align="start">
              <Heading size="sm" color="brand.textPrimary" mb={4}>Legal</Heading>
              <VStack align="start" spacing={2}>
                <Text as="a" href="/privacy" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Privacy Policy</Text>
                <Text as="a" href="/terms" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Terms of Service</Text>
              </VStack>
            </VStack>
          </Grid>

          <HStack justify="center" spacing={6} mt={8} pt={8} borderTop="1px" borderColor="gray.300">
            <Text as="a" href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Twitter</Text>
            <Text as="a" href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>Instagram</Text>
            <Text as="a" href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>LinkedIn</Text>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Universities;
