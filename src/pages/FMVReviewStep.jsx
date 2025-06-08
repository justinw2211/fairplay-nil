import React, { useEffect, useState } from "react";
import {
  Box, Button, Flex, Heading, Text, Stack, useToast, Spinner
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FMVReviewStep({ formData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fmvResult, setFmvResult] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const fullData = {
      ...formData.step1,
      ...formData.step2,
      is_real_submission: formData.step2?.is_real_submission === "yes"
    };

    setIsLoading(true);
    try {
      console.log("Sending data:", fullData);
      const res = await fetch("https://fairplay-nil-backend.onrender.com/api/fmv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData)
      });

      const data = await res.json();
      if (res.ok) {
        setFmvResult(data.fmv_estimate || "$0");
        navigate("/result", { state: { fmvResult: data } });
      } else {
        toast({ title: "Submission failed", description: data?.detail || "Error", status: "error" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Network error", description: "Please try again later.", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}>
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={4}>Review Your Info</Heading>
        <Stack spacing={2} mb={6}>
          <Text><b>Name:</b> {formData.step1?.name}</Text>
          <Text><b>Email:</b> {formData.step1?.email}</Text>
          <Text><b>Sport:</b> {formData.step1?.sport}</Text>
          <Text><b>Deal Value Proposed:</b> ${formData.step2?.proposed_dollar_amount}</Text>
          <Text><b>Real Submission:</b> {formData.step2?.is_real_submission}</Text>
        </Stack>
        <Flex gap={3} justify="center" mt={6}>
          <Button colorScheme="gray" variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button colorScheme="green" onClick={handleSubmit} isLoading={isLoading}>
            Submit Deal
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
