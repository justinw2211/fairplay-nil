import React, { useState } from "react";
import { useFMV } from "../context/FMVContext";
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast, Divider,
  Modal, ModalOverlay, ModalContent, ModalBody, Spinner, VStack
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const formatNumber = (num) => num ? Number(num) : 0;

export default function FMVReviewStep({ onBack }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormReset = () => {
    resetFormData();
    toast({
      title: "Form reset!",
      description: "Your information has been cleared.",
      status: "info",
      duration: 2000,
      isClosable: true
    });
    navigate('/fmvcalculator/step1');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare deliverables with counts for the payload
    const deliverablesWithCounts = formData.deliverables
      .filter(d => d !== 'None' && d !== 'Other')
      .map(d => `${d} (Qty: ${formData.deliverables_count[d] || 0})`);
    
    if (formData.deliverables.includes('Other') && formData.deliverable_other) {
      deliverablesWithCounts.push(`Other: ${formData.deliverable_other}`);
    }

    const payload = {
      name: formData.name || "",
      email: formData.email || "",
      school: formData.school || "",
      division: formData.division || null,
      conference: formData.conference || "",
      gender: formData.gender || "",
      sport: Array.isArray(formData.sport) ? formData.sport.join(', ') : formData.sport || "",
      graduation_year: formatNumber(formData.graduation_year),
      age: formatNumber(formData.age),
      gpa: formatNumber(formData.gpa),
      achievements: formData.achievements || [],
      prior_nil_deals: formatNumber(formData.prior_nil_deals),
      followers_instagram: formatNumber(formData.followers_instagram),
      followers_tiktok: formatNumber(formData.followers_tiktok),
      followers_twitter: formatNumber(formData.followers_twitter),
      followers_youtube: formatNumber(formData.followers_youtube),
      deliverables: deliverablesWithCounts, // Use the new formatted array
      payment_structure: Array.isArray(formData.payment_structure) ? formData.payment_structure.join(', ') : formData.payment_structure || "",
      deal_length_months: formatNumber(formData.deal_length_months),
      proposed_dollar_amount: formatNumber(formData.proposed_dollar_amount),
      deal_type: Array.isArray(formData.deal_type) ? formData.deal_type.join(', ') : formData.deal_type || "",
      deal_category: Array.isArray(formData.deal_category) ? formData.deal_category.join(', ') : formData.deal_category || "",
      brand_partner: formData.brand_partner || "",
      geography: formData.geography || "",
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
      updateFormData(finalFormData);
      localStorage.setItem("fmvFormData", JSON.stringify(finalFormData));
      
      const isReal = String(formData.is_real_submission).toLowerCase() === "yes";
      if (isReal) {
        console.log("Submitting to backend:", payload);
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
                      <Text color="#4e6a7b">Sport(s):</Text><Text fontWeight="500">{formData.sport?.join(', ') || "-"}</Text>
                      <Text color="#4e6a7b">Achievements:</Text><Text fontWeight="500">{formData.achievements?.join(', ') || "N/A"}</Text>
                      <Text color="#4e6a7b">Total Followers:</Text><Text fontWeight="500">{totalFollowers.toLocaleString()}</Text>
                  </SimpleGrid>
              </Box>
              <Divider borderColor="#d6dce4" />
               <Box>
                  <Flex justify="space-between" mb={3} align="center">
                      <Heading size="md" color="#282f3d">Deal Details</Heading>
                      <Button size="sm" variant="link" color="#d0bdb5" onClick={() => navigate('/fmvcalculator/step3')}>Edit</Button>
                  </Flex>
                   <SimpleGrid columns={1} spacingY={2}>
                      <Flex justify="space-between"><Text color="#4e6a7b">Brand:</Text><Text fontWeight="500" textAlign="right">{formData.brand_partner || "-"}</Text></Flex>
                      <Flex justify="space-between"><Text color="#4e6a7b">Deal Value:</Text><Text fontWeight="500" textAlign="right">${formatNumber(formData.proposed_dollar_amount).toLocaleString()}</Text></Flex>
                      <Flex justify="space-between"><Text color="#4e6a7b">Payment Structure:</Text><Text fontWeight="500" textAlign="right">{formData.payment_structure?.join(', ') || "-"}</Text></Flex>
                      <Flex justify="space-between"><Text color="#4e6a7b">Industry:</Text><Text fontWeight="500" textAlign="right">{formData.deal_category?.join(', ') || "-"}</Text></Flex>
                      
                      <Box>
                        <Text color="#4e6a7b">Deliverables:</Text>
                        <Stack pl={4} mt={1} spacing={0}>
                          {(formData.deliverables && !formData.deliverables.includes("None")) ? formData.deliverables.map(d => (
                            <Text key={d} fontWeight="500">
                              - {d} {d !== 'Other' && `(Qty: ${formData.deliverables_count?.[d] || 0})`}
                              {d === 'Other' && formData.deliverable_other && `: ${formData.deliverable_other}`}
                            </Text>
                          )) : <Text fontWeight="500">- None</Text>}
                        </Stack>
                      </Box>

                   </SimpleGrid>
              </Box>
          </Stack>

          <Flex mt={8} justify="space-between">
              <Button onClick={onBack} variant="outline" isDisabled={isSubmitting}>Back</Button>
              <Button onClick={handleSubmit} isDisabled={isSubmitting}>Calculate & Submit</Button>
          </Flex>

          <Flex mt={3} justify="space-between" align="center">
            <Button size="sm" variant="ghost" color="#4e6a7b" onClick={handleFormReset}>Reset Form</Button>
            <Button size="sm" variant="ghost" color="#4e6a7b" onClick={() => {
                toast({
                  title: "Progress Saved!",
                  description: "You can close this window and your data will be saved for your next visit.",
                  status: "success",
                  duration: 2000,
                  isClosable: true
                });
              }}>Save Progress</Button>
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