// src/pages/Home.jsx
import React from 'react';
import { Box, Flex, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const navigate = useNavigate();
  return (
    <Flex
      minH={{ base: 'calc(100vh - 80px)', md: 'calc(100vh - 88px)' }}
      align="center"
      justify="center"
      p={4}
    >
      <VStack
        spacing={6}
        textAlign="center"
        bg="brand.secondary"
        p={{ base: 8, md: 16 }}
        borderRadius="xl"
        shadow="lg"
      >
        <Heading as="h1" size={{ base: 'xl', md: '2xl' }}>
          Clarity Before Compliance
        </Heading>
        <Text maxW="xl" fontSize={{ base: 'lg', md: 'xl' }} color="brand.textSecondary">
          Instantly estimate the Fair Market Value of your NIL deal and build
          compliance with confidence.
        </Text>
        <Button
          size="lg"
          px={10}
          rightIcon={<FiArrowRight />}
          onClick={() => navigate('/fmvcalculator')}
        >
          Estimate FMV
        </Button>
      </VStack>
    </Flex>
  );
}