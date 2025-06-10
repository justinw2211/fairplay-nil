// src/pages/Security.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Security() {
    return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          Security
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
            Your data privacy and security are our top priority. We utilize industry-standard
            encryption and best practices to ensure your information is always protected.
        </Text>
      </VStack>
    </Box>
  );
}