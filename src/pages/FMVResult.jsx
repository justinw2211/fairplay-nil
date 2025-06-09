
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Divider,
} from "@chakra-ui/react";
import { useLocation, Link } from "react-router-dom";

const FMVResult = () => {
  const location = useLocation();
  const [fmvResult, setFmvResult] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    try {
      if (location.state?.fmvResult && location.state?.formData) {
        setFmvResult(location.state.fmvResult);
        setFormData(location.state.formData);
        localStorage.setItem("fmvResult", JSON.stringify(location.state.fmvResult));
        localStorage.setItem("formData", JSON.stringify(location.state.formData));
      } else {
        const storedFmv = JSON.parse(localStorage.getItem("fmvResult"));
        const storedForm = JSON.parse(localStorage.getItem("formData"));
        if (typeof storedFmv === "number" && storedForm?.name && storedForm?.email) {
          setFmvResult(storedFmv);
          setFormData(storedForm);
        }
      }
    } catch (err) {
      console.error("Error loading FMV result", err);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("fmvResult");
      localStorage.removeItem("formData");
    };
  }, []);

  if (!fmvResult || !formData) {
    return (
      <Box p={10}>
        <Heading size="lg">Oops! Something went wrong.</Heading>
        <Text mt={4}>
          It looks like you refreshed the page or accessed this result page directly.
        </Text>
        <Button as={Link} to="/calculator" colorScheme="green" mt={6}>
          Start Over
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="700px" mx="auto" p={8}>
      <Heading size="xl" mb={4}>
        Your Fair Market Valuation
      </Heading>
      <Text fontSize="2xl" fontWeight="bold" color="green.400">
        ${fmvResult.toLocaleString()}
      </Text>
      <Divider my={6} />
      <Stack spacing={3}>
        <Text><strong>Name:</strong> {formData.name}</Text>
        <Text><strong>Email:</strong> {formData.email}</Text>
        <Text><strong>School:</strong> {formData.school}</Text>
        <Text><strong>Sport:</strong> {formData.sport}</Text>
        <Text><strong>Social Followers:</strong> {formData.followers}</Text>
        <Text><strong>Deliverables:</strong> {Object.entries(formData.deliverables || {}).map(
          ([platform, count]) => `${platform}: ${count}`
        ).join(", ")}</Text>
      </Stack>
      <Button as={Link} to="/" mt={8} colorScheme="green">
        Back to Home
      </Button>
    </Box>
  );
};

export default FMVResult;
