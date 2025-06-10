// src/pages/Careers.jsx
import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function Careers() {
    return (
    <Box maxW="5xl" mx="auto" py={{ base: 12, md: 24 }} px={8}>
      <VStack spacing={4} align="start">
        <Heading as="h1" size="xl">
          Careers at FairPlay NIL
        </Heading>
        <Text fontSize="lg" color="brand.textSecondary">
            We are always looking for passionate and talented individuals to join our mission.
            Check back soon for open positions.
        </Text>
      </VStack>
    </Box>
  );
}