import React from "react";
import { Box, Container, VStack, Heading, Text, Button, Icon, Stack, Badge, useDisclosure } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import ContactUsModal from "../components/ContactUsModal";
import Footer from "../components/Footer";

const Collectives = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (payload) => {
    // TODO: wire to backend/email; for now noop
    return Promise.resolve();
  };


  return (
    <Box bgGradient="linear(to-b, gray.50, white)" minH="100vh" pt={{ base: 16, md: 24 }}>
      <Container maxW="6xl">
        <VStack spacing={8} align="center" textAlign="center">
          <Badge colorScheme="blue" px={3} py={1} borderRadius="md">Coming Soon</Badge>
          <Icon as={FiClock} boxSize={12} color="brand.accentPrimary" />
          <Heading size={{ base: "xl", md: "2xl" }} color="brand.textPrimary">
            Solutions for Collectives
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="brand.textSecondary" maxW="3xl">
            We’re crafting purpose-built tools to help collectives operate transparently, streamline
            compliance, and maximize value for student-athletes and partners. Detailed features and
            onboarding are on the way.
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={2}>
            <Button as={RouterLink} to="/how-it-works" colorScheme="blue">
              Explore How It Works
            </Button>
            <Button variant="outline" onClick={onOpen}>
              Contact Us
            </Button>
            <Button as={RouterLink} to="/" variant="ghost">
              Back to Home
            </Button>
          </Stack>
        </VStack>
      </Container>
      <Box mt={{ base: 10, md: 16 }} />
      <Footer />
      <ContactUsModal isOpen={isOpen} onClose={onClose} onSubmit={handleSubmit} />
    </Box>
  );
};

export default Collectives;
