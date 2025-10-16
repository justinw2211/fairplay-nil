
import React from "react";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const Security = () => {
  const { user } = useAuth();
  return (
    <Box bg="brand.backgroundLight" minH="100vh" py={12}>
      <Container maxW="4xl">
        <VStack align="start" spacing={4}>
          <Heading size="xl" color="brand.textPrimary">Security</Heading>
          <Text color="brand.textSecondary">This is the Security landing page.</Text>
        </VStack>
      </Container>
      {!user && <Footer />}
    </Box>
  );
};
export default Security;
