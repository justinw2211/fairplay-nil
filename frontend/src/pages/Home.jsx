// src/pages/Home.jsx
import React from "react";
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useFMV } from "../context/FMVContext.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { initializeNewCalculation } = useFMV();

  const handleStart = async () => {
    await initializeNewCalculation();
    navigate("/fmvcalculator/step1");
  };

  return (
    <Flex minH="90vh" align="center" justify="center">
      <Box textAlign="center" p={12} maxW="3xl">
        <Heading mb={4} size="3xl" fontWeight="800" color="brand.textPrimary">
          Clarity Before Compliance
        </Heading>
        <Text mb={8} color="brand.textSecondary" fontSize="xl" maxW="2xl" mx="auto">
          Instantly estimate the Fair Market Value of your NIL deal and build compliance with confidence.
        </Text>
        <Button
          size="lg"
          px={10}
          onClick={handleStart}
        >
          Estimate FMV
        </Button>
      </Box>
    </Flex>
  );
}