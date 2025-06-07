import React from "react";
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Flex minH="90vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white">
      <Box textAlign="center" p={8} bg="gray.900" borderRadius="2xl" boxShadow="2xl">
        <Heading mb={4} color="white" size="2xl">Clarity Before Compliance</Heading>
        <Text mb={7} color="gray.200" fontSize="xl">
          Instantly estimate the Fair Market Value of your NIL deal and build compliance with confidence.
        </Text>
        <Button size="lg" colorScheme="green" px={10} fontWeight="bold"
          onClick={() => navigate("/fmvcalculator/step1")}>
          Estimate FMV
        </Button>
      </Box>
    </Flex>
  );
}
