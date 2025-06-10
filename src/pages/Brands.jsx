// src/pages/Brands.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Brands() {
  return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          For Brands
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
          Maximize your ROI in the collegiate athlete space. Our valuation tools
          help you structure fair and effective NIL partnerships.
        </Text>
      </VStack>
    </Box>
  );
}