// src/pages/AboutUs.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function AboutUs() {
  return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          About Us
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
          We are a team of data scientists, engineers, and former collegiate athletes
          dedicated to bringing transparency to the NIL ecosystem.
        </Text>
      </VStack>
    </Box>
  );
}