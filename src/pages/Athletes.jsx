// src/pages/Athletes.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Athletes() {
  return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          For Athletes
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
          Learn how FairPlay NIL empowers athletes to know their value and stay
          compliant. Our tools are designed to provide transparency and insight
          into the complex world of Name, Image, and Likeness compensation.
        </Text>
      </VStack>
    </Box>
  );
}