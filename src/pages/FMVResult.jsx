import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function FMVResult() {
  return (
    <Box w="100%" maxW="lg" mx="auto" py={10}>
      <Heading size="lg" mb={4}>Your NIL FMV Estimate</Heading>
      <Text fontSize="2xl" fontWeight="bold" color="green.300">$8,750</Text>
      <Text mt={4}>Thank you for completing the survey!</Text>
    </Box>
  );
}