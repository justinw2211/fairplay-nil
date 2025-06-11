import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function Athletes() {
  return (
    <Box p={12} bg="#f4f4f4" color="#282f3d">
      <Heading mb={4} color="#282f3d">For Athletes</Heading>
      <Text fontSize="lg" color="#4e6a7b">
        Learn how FairPlay NIL empowers athletes to know their value and stay compliant.
      </Text>
    </Box>
  );
}