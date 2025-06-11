import React, { useState } from "react";
import { useFMV } from "../context/FMVContext"; // Import the context hook
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast, Divider,
  Modal, ModalOverlay, ModalContent, ModalBody, Spinner, VStack
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
    <>
      <Flex minH="100vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d" py={10}>
        <Box w={["95vw", "600px"]} bg="#ffffff" boxShadow="xl" borderRadius="xl" p={[4, 8]} mx="auto" border="1px solid #d6dce4">
          <Heading size="lg" mb={2} color="#282f3d">Review & Confirm</Heading>
          <Text color="#4e6a7b" mb={6}>Please review your responses below.</Text>
          
          <Stack spacing={6}>
              <Box>
                  <Flex justify="space-between" mb={3} align="center">
                      <Heading size="md" color="#282f3d">Athlete Profile</Heading>
                      <Button size="sm" variant="link" color="#d0bdb5" onClick={() => navigate('/fmvcalculator/step1')}>Edit</Button>
                  </Flex>
                  <SimpleGrid columns={2} spacingY={2} spacingX={4}>
                      <Text color="#4e6a7b">Name:</Text><Text fontWeight="500">{formData.name || "-"}</Text>
                      <Text color="#4e6a7b">Email:</Text><Text fontWeight="500">{formData.email || "-"}</Text>
                      <Text color="#4e6a7b">School:</Text><Text fontWeight="500">{formData.school || "-"}</Text>
                      <Text color="#4e6a7b">Sport:</Text><Text fontWeight="500">{formData.sport || "-"}</Text>
                      <Text color="#4e6a7b">Total Followers:</Text><Text fontWeight="500">{totalFollowers.toLocaleString()}</Text>
                  </SimpleGrid>
              </Box>
              <Divider borderColor="#d6dce4" />
               <Box>
                  <Flex justify="space-between" mb={3} align="center">
                      <Heading size="md" color="#282f3d">Deal Details</Heading>
                      <Button size="sm" variant="link" color="#d0bdb5" onClick={() => navigate('/fmvcalculator/step2')}>Edit</Button>
                  </Flex>
                   <SimpleGrid columns={2} spacingY={2} spacingX={4}>
                      <Text color="#4e6a7b">Brand:</Text><Text fontWeight="500">{formData.brand_partner || "-"}</Text>
                      <Text color="#4e6a7b">Proposed Value:</Text><Text fontWeight="500">${formatNumber(formData.proposed_dollar_amount).toLocaleString()}</Text>
                      <Text color="#4e6a7b">Deliverables:</Text><Text fontWeight="500">{formData.deliverables?.join(', ') || "-"}</Text>
                   </SimpleGrid>
              </Box>
          </Stack>

          <Flex mt={8} justify="space-between">
              <Button onClick={onBack} variant="outline" borderColor="#d6dce4" color="#4e6a7b" _hover={{ bg: "#f4f4f4" }} isDisabled={isSubmitting}>Back</Button>
              <Button bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }} px={8} fontWeight="bold" onClick={handleSubmit} isDisabled={isSubmitting}>Calculate & Submit</Button>
          </Flex>
        </Box>
      </Flex>
      
      <Modal isOpen={isSubmitting} onClose={() => {}} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
              <ModalBody>
                  <VStack spacing={4}>
                      <Spinner size="xl" color="#d0bdb5" thickness="4px" />
                      <Text color="#282f3d" fontSize="lg" fontWeight="600">
                          Calculating Your FMV...
                      </Text>
                  </VStack>
              </ModalBody>
          </ModalContent>
      </Modal>
    </>
  );
}