import React, { useState } from "react";
import { useFMV } from "../context/FMVContext"; // Import the context hook
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast, Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// Helper to format numbers or return a default
const formatNumber = (num) => num ? Number(num) : 0;

export default function FMVReviewStep({ onBack }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData } = useFMV(); // Get data from context
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Build the complete payload from the context data
    const payload = {
      // Step 1 data
      name: formData.name || "",
      email: formData.email || "",
      school: formData.school || "",
      division: formData.division || null,
      conference: formData.conference || "", // This field isn't in the form, will be empty
      gender: formData.gender || "",
      sport: formData.sport || "",
      graduation_year: formatNumber(formData.graduation_year),
      age: formatNumber(formData.age),
      gpa: formatNumber(formData.gpa),
      achievements: formData.achievements || [], // This field isn't in the form, will be empty
      athlete_status: formData.athlete_status || "", // This field isn't in the form, will be empty
      prior_nil_deals: formatNumber(formData.prior_nil_deals),
      
      // Step 2 data - including follower counts
      followers_instagram: formatNumber(formData.followers_instagram),
      followers_tiktok: formatNumber(formData.followers_tiktok),
      followers_twitter: formatNumber(formData.followers_twitter),
      followers_youtube: formatNumber(formData.followers_youtube),
      
      deliverables_instagram: 0, // Placeholder, adjust if you track these
      deliverables_tiktok: 0,    // Placeholder, adjust if you track these
      deliverables_twitter: 0,   // Placeholder, adjust if you track these
      deliverables_youtube: 0,   // Placeholder, adjust if you track these
      deliverable_other: formData.deliverable_other || "",

      payment_structure: formData.payment_structure || "",
      deal_length_months: formatNumber(formData.deal_length_months),
      proposed_dollar_amount: formatNumber(formData.proposed_dollar_amount),
      deal_type: Array.isArray(formData.deal_type) ? formData.deal_type.join(', ') : formData.deal_type || "",
      deal_category: formData.deal_category || "",
      brand_partner: formData.brand_partner || "",
      geography: formData.geography || "", // This field isn't in the form, will be empty
    };

    try {
      const calcRes = await fetch("https://fairplay-nil-backend.onrender.com/api/fmv/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!calcRes.ok) {
        const errorData = await calcRes.json().catch(() => ({ error: "Calculation failed with no error message." }));
        throw new Error(errorData.detail || errorData.error || "FMV calculation failed");
      }
      
      const calcData = await calcRes.json();
      
      const finalFormData = { ...formData, fmv: calcData.fmv };
      updateFormData(finalFormData); // Update context
      
      // Save to localStorage for the result page fallback
      localStorage.setItem("fmvFormData", JSON.stringify(finalFormData));
      
      const isReal = String(formData.is_real_submission).toLowerCase() === "yes";
      if (isReal) {
        // In a real app, you would also submit this to a /submit endpoint
        console.log("Submitting to backend:", { ...payload, fmv: calcData.fmv });
      }

      navigate("/result", { state: { formData: finalFormData } });

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong during submission.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalFollowers =
    formatNumber(formData.followers_instagram) +
    formatNumber(formData.followers_tiktok) +
    formatNumber(formData.followers_twitter) +
    formatNumber(formData.followers_youtube);

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
                    <Text color="gray.400">School:</Text><Text>{formData.school || "-"}</Text>
                    <Text color="gray.400">Sport:</Text><Text>{formData.sport || "-"}</Text>
                    <Text color="gray.400">Total Followers:</Text><Text>{totalFollowers.toLocaleString()}</Text>
                </SimpleGrid>
            </Box>
            <Divider />
             <Box>
                <Flex justify="space-between" mb={2} align="center">
                    <Heading size="md">Deal Details</Heading>
                    <Button size="sm" colorScheme="green" variant="link" onClick={() => navigate('/fmvcalculator/step2')}>Edit</Button>
                </Flex>
                 <SimpleGrid columns={2} spacing={2}>
                    <Text color="gray.400">Brand:</Text><Text>{formData.brand_partner || "-"}</Text>
                    <Text color="gray.400">Proposed Value:</Text><Text>${formatNumber(formData.proposed_dollar_amount).toLocaleString()}</Text>
                    <Text color="gray.400">Deliverables:</Text><Text>{formData.deliverables?.join(', ') || "-"}</Text>
                 </SimpleGrid>
            </Box>
        </Stack>

        <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline" colorScheme="green">Back</Button>
            <Button colorScheme="green" px={8} fontWeight="bold" onClick={handleSubmit} isLoading={isSubmitting} loadingText="Submitting">Calculate & Submit</Button>
        </Flex>
      </Box>
    </Flex>
  );
}
