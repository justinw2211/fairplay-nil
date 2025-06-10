// src/pages/Collectives.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Collectives() {
  return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          For Collectives
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
          Understand the landscape and your role. FairPlay NIL provides data-driven insights
          to help collectives make informed decisions and build sustainable models.
        </Text>
      </VStack>
    </Box>
  );
}