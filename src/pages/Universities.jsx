// src/pages/Universities.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Universities() {
  return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          For Universities
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
          This page provides more context about universities. It is part of
          FairPlay NIL’s mission to offer transparency and value to key
          stakeholders in collegiate athletics.
        </Text>
      </VStack>
    </Box>
  );
}