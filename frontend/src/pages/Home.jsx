// frontend/src/pages/Home.jsx
import React from "react";
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useFMVContext } from "../context/FMVContext.jsx"; // CORRECTED import

export default function Home() {
  const navigate = useNavigate();
  // CORRECTED function name from context
  const { resetAndPrefill } = useFMVContext(); 

  const handleGetStarted = () => {
    // Correctly call the function to clear any old form data
    resetAndPrefill(); 
    navigate('/dashboard/new-deal');
  };

  return (
    <Box>
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="calc(80vh)"
        bg="brand.background"
        textAlign="center"
        px={6}
      >
        <Heading
          as="h1"
          size="4xl"
          fontWeight="extrabold"
          color="brand.textPrimary"
          letterSpacing="tight"
        >
          Navigate NIL with
          <Text as="span" color="brand.accentPrimary"> Absolute Confidence</Text>
        </Heading>
        <Text
          mt={4}
          maxW="2xl"
          fontSize="xl"
          color="brand.textSecondary"
        >
          FairPlay is the leading compliance and valuation platform, empowering athletes, universities, and brands to build partnerships securely and efficiently.
        </Text>
        <Button
          mt={8}
          size="lg"
          colorScheme="pink"
          bg="brand.accentPrimary"
          color="white"
          px={10}
          py={7}
          onClick={handleGetStarted}
          _hover={{ bg: '#c8aeb0' }}
        >
          Get Started
        </Button>
      </Flex>
    </Box>
  );
}