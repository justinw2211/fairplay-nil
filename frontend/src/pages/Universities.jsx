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
  const accentColor = "#d4a5a7";
  const primaryColor = "#2D3748";

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
      badgeColor: "blue",
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
      badgeColor: "green",
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
      badgeColor: "purple",
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

      {/* Pricing Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" size="xl" color={primaryColor}>
                Choose the Right Package for Your Program
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                Flexible pricing options designed to scale with your athletic program's needs and budget.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} w="full">
              {packages.map((pkg, index) => (
                <Card
                  key={index}
                  bg="white"
                  shadow="xl"
                  borderRadius="xl"
                  position="relative"
                  transform={index === 1 ? "scale(1.05)" : "scale(1)"}
                  border={index === 1 ? `2px solid ${accentColor}` : "1px solid"}
                  borderColor={index === 1 ? accentColor : "gray.200"}
                >
                  {pkg.badge && (
                    <Badge
                      position="absolute"
                      top="-10px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme={pkg.badgeColor}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      {pkg.badge}
                    </Badge>
                  )}
                  
                  <CardHeader pb={4}>
                    <VStack spacing={2} align="start">
                      <Heading as="h3" size="lg" color={primaryColor}>
                        {pkg.name}
                      </Heading>
                      <HStack align="baseline">
                        <Text fontSize="3xl" fontWeight="bold" color={primaryColor}>
                          {pkg.price}
                        </Text>
                        <Text color="gray.500">{pkg.period}</Text>
                      </HStack>
                      <Text color="gray.600" fontSize="sm">
                        {pkg.description}
                      </Text>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack spacing={6} align="stretch">
                      <List spacing={3}>
                        {pkg.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex}>
                            <HStack align="start">
                              <ListIcon as={FiCheckCircle} color="green.500" mt={0.5} />
                              <Text fontSize="sm" color="gray.700">
                                {feature}
                              </Text>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>

                      <Button
                        size="lg"
                        bg={index === 1 ? accentColor : "gray.100"}
                        color={index === 1 ? "white" : "gray.700"}
                        _hover={{
                          bg: index === 1 ? "#c8aeb0" : "gray.200"
                        }}
                        w="full"
                      >
                        {pkg.price === "Custom" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

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

      {/* CTA Section */}
      <Box bg={primaryColor} color="white" py={16}>
        <Container maxW="5xl">
          <VStack spacing={6} textAlign="center">
            <Heading as="h2" size="xl">
              Ready to Transform Your NIL Program?
            </Heading>
            <Text fontSize="lg" color="gray.200" maxW="3xl">
              Join hundreds of athletic programs already using FairPlay NIL to manage their 
              NIL operations with confidence and compliance.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg={accentColor}
                color="white"
                _hover={{ bg: "#c8aeb0" }}
                px={8}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.100" }}
                px={8}
              >
                Contact Sales
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Universities;
