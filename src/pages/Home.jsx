import React from "react";
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Flex minH="90vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d">
      <Box textAlign="center" p={12} maxW="3xl">
        <Heading mb={4} color="#282f3d" size="3xl" fontWeight="800">Clarity Before Compliance</Heading>
        <Text mb={8} color="#4e6a7b" fontSize="xl" maxW="2xl" mx="auto">
          Instantly estimate the Fair Market Value of your NIL deal and build compliance with confidence.
        </Text>
        <Button
          size="lg"
          px={10}
          fontWeight="bold"
          colorScheme="gray"
          bg="#d0bdb5"
          color="#ffffff"
          _hover={{ bg: "#c9b2a9" }}
          onClick={() => navigate("/fmvcalculator/step1")}
        >
          Estimate FMV
        </Button>
      </Box>
    </Flex>
  );
}