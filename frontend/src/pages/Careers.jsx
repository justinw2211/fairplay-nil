
import React from "react";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import Footer from "../components/Footer";

const Careers = () => {
  return (
    <Box bg="brand.backgroundLight" minH="100vh" py={12}>
      <Container maxW="4xl">
        <VStack align="start" spacing={4}>
          <Heading size="xl" color="brand.textPrimary">Careers</Heading>
          <Text color="brand.textSecondary">This is the Careers landing page.</Text>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};
export default Careers;
