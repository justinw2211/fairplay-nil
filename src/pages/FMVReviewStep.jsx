import React, { useState } from "react";
import { useFMV } from "../context/FMVContext"; // Import the context hook
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FMVReviewStep({ onBack }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData } = useFMV(); // Get data and update function from context
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // The payload is now built directly from the complete formData in the context
    const isReal = String(formData.is_real_submission).toLowerCase() === "yes";

    const payload = {
      name: formData.name || "",
      email: formData.email || "",
      school: formData.school || "",
      division: Number(formData.division) || null,
      // ... continue mapping all fields from formData
      proposed_dollar_amount: Number(formData.proposed_dollar_amount) || 0,
      // ...
    };

    try {
      const calcRes = await fetch("https://fairplay-nil-backend.onrender.com/api/fmv/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const calcData = await calcRes.json();
      if (!calcRes.ok) throw new Error(calcData?.error || "FMV calculation failed");
      
      // Update context with the new FMV value
      updateFormData({ fmv: calcData.fmv });

      // Save to localStorage and pass state for FMVResult fallback support
      localStorage.setItem("fmvFormData", JSON.stringify({ ...formData, fmv: calcData.fmv }));
      
      // ... (logic for real submission if needed)

      navigate("/result", { state: { formData: { ...formData, fmv: calcData.fmv } } });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}>
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={4}>Review & Confirm</Heading>
        <Text color="gray.300" mb={6}>Please review your responses below.</Text>
        
        <Stack spacing={6}>
            <Box>
                <Flex justify="space-between" mb={2} align="center">
                    <Heading size="md">Athlete Profile</Heading>
                    <Button size="sm" colorScheme="green" variant="link" onClick={() => navigate('/fmvcalculator/step1')}>Edit</Button>
                </Flex>
                <SimpleGrid columns={2} spacing={2}>
                    <Text color="gray.400">Name:</Text><Text>{formData.name || "-"}</Text>
                    <Text color="gray.400">Email:</Text><Text>{formData.email || "-"}</Text>
                    {/* ... display other formData values ... */}
                </SimpleGrid>
            </Box>
             <Box>
                <Flex justify="space-between" mb={2} align="center">
                    <Heading size="md">Deal Details</Heading>
                    <Button size="sm" colorScheme="green" variant="link" onClick={() => navigate('/fmvcalculator/step2')}>Edit</Button>
                </Flex>
                 <SimpleGrid columns={2} spacing={2}>
                    <Text color="gray.400">Brand:</Text><Text>{formData.brand_partner || "-"}</Text>
                    {/* ... display other formData values ... */}
                 </SimpleGrid>
            </Box>
        </Stack>

        <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline" colorScheme="green">Back</Button>
            <Button colorScheme="green" px={8} fontWeight="bold" onClick={handleSubmit} isLoading={isSubmitting} loadingText="Submitting">Submit</Button>
        </Flex>
      </Box>
    </Flex>
  );
}
