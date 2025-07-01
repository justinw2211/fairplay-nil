// frontend/src/pages/Home.jsx
import React from 'react';
import { 
  Box, 
  Button, 
  Container,
  Flex, 
  Grid,
  Heading, 
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text, 
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ShieldIcon } from '@chakra-ui/icons';
import { TrendingUp, Twitter, Instagram, Linkedin } from 'lucide-react';

const Feature = ({ icon, title, text }) => {
  return (
    <VStack align="center" spacing={6} p={6}>
      <Flex
        align="center"
        justify="center"
        bg="brand.accentSecondary"
        w="16"
        h="16"
        rounded="full"
      >
        <Icon as={icon} boxSize={8} color="brand.textPrimary" />
      </Flex>
      <VStack spacing={3} textAlign="center">
        <Heading as="h3" size="md" color="brand.textPrimary">
          {title}
        </Heading>
        <Text color="brand.textSecondary">
          {text}
        </Text>
      </VStack>
    </VStack>
  );
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box bg="white">
      {/* Hero Section */}
      <Container maxW="7xl" py={20}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          <VStack align="start" spacing={6}>
            <Heading
              as="h1"
              size="2xl"
              lineHeight="tight"
              color="brand.textPrimary"
            >
              Navigate NIL Dealmaking with Confidence
            </Heading>
            <Text fontSize="xl" color="brand.textSecondary">
              FairPlay NIL provides the tools and resources for student-athletes to manage their deals, stay
              compliant, and maximize their earnings.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Button
                size="lg"
                bg="brand.accentPrimary"
                color="white"
                onClick={() => navigate('/signup')}
                _hover={{ opacity: 0.9 }}
              >
                Get Started for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderWidth={2}
                borderColor="brand.accentPrimary"
                color="brand.textPrimary"
                _hover={{ opacity: 0.8 }}
              >
                How It Works
              </Button>
            </Stack>
          </VStack>
          <Box>
            <Image
              src="/logo.png"
              alt="Diverse group of student-athletes"
              rounded="lg"
              shadow="lg"
            />
          </Box>
        </Grid>
      </Container>

      {/* Problem/Solution Section */}
      <Box bg="brand.backgroundLight" py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <Heading
              as="h2"
              size="xl"
              color="brand.textPrimary"
              textAlign="center"
            >
              NIL is Complicated. We Make it Simple.
            </Heading>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
              <Feature
                icon={ShieldIcon}
                title="Total Compliance"
                text="Stay ahead of the rules. Our platform helps you track and report your activities to ensure you're always compliant with NCAA and school policies."
              />
              <Feature
                icon={CheckCircleIcon}
                title="Centralized Deal Flow"
                text="From contract uploads to payment tracking, manage every aspect of your NIL deals in one secure dashboard."
              />
              <Feature
                icon={TrendingUp}
                title="Fair Compensation"
                text="Understand your value. We provide insights and tools to help you secure fair and transparent compensation."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box bg="brand.accentPrimary" py={20}>
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <Heading as="h2" size="xl" color="white">
              Ready to Take Control of Your NIL?
            </Heading>
            <Button
              size="lg"
              bg="white"
              color="brand.textPrimary"
              px={8}
              fontSize="lg"
              fontWeight="semibold"
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/signup')}
            >
              Sign Up Today
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="brand.backgroundLight" py={12}>
        <Container maxW="7xl">
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
            gap={8}
          >
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
    </Box>
  );
};

export default Home;