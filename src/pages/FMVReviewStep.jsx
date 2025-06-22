// src/pages/FMVReviewStep.jsx
import React, { useState } from "react";
import { useFMV } from "../context/FMVContext";
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, Flex, Heading, Stack, Text, SimpleGrid, useToast, Divider,
  Modal, ModalOverlay, ModalContent, ModalBody, Spinner, VStack
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient.js';

const formatNumber = (num) => num ? Number(num) : 0;

export default function FMVReviewStep({ onBack }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();
  const { user } = useAuth();
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
    
    const deliverablesWithCounts = (formData.deliverables || [])
      .filter(d => d !== 'None' && d !== 'Other')
      .map(d => `${d} (Qty: ${formData.deliverables_count?.[d] || 0})`);
    
    if (formData.deliverables?.includes('Other') && formData.deliverable_other) {
      deliverablesWithCounts.push(`Other: ${formData.deliverable_other}`);
    }

    const basePayload = { ...formData, deliverables: deliverablesWithCounts };

    try {
      const calcRes = await fetch("https://fairplay-nil-backend.onrender.com/api/fmv/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });

      if (!calcRes.ok) {
        throw new Error("FMV calculation failed");
      }
      
      const calcData = await calcRes.json();
      const finalFormData = { ...formData, fmv: calcData.fmv };
      updateFormData(finalFormData);
      
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Authentication session not found.");
        
        // THE FIX: Prepare a clean payload that exactly matches the backend schema.
        const dealPayload = {
            ...formData,
            fmv: calcData.fmv,
            // Ensure the key is 'sport' (singular) as required by the API
            sport: formData.sport || [],
            // Ensure optional numeric fields are sent as numbers or null, never empty strings
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            age: formData.age ? parseInt(formData.age, 10) : null,
            prior_nil_deals: formData.prior_nil_deals ? parseInt(formData.prior_nil_deals, 10) : null,
        };

        const dealRes = await fetch("https://fairplay-nil-backend.onrender.com/api/deals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify(dealPayload),
        });

        if (!dealRes.ok) {
            const errorBody = await dealRes.json();
            console.error("Failed deal response:", errorBody);
            const errorMsg = errorBody.detail?.[0]?.msg || "Failed to save the deal to your dashboard.";
            throw new Error(errorMsg);
        }
        toast({ title: "Deal saved to your dashboard!", status: 'success' });
        navigate("/dashboard");

      } else {
        navigate("/result", { state: { formData: finalFormData } });
      }

    } catch (error) {
      toast({
        title: "An Error Occurred",
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
              <Button onClick={handleSubmit} isLoading={isSubmitting} loadingText="Saving...">
                {user ? 'Calculate & Save to Dashboard' : 'Calculate & Submit'}
              </Button>
          </Flex>
          <Flex mt={3} justify="space-between" align="center">
            <Button size="sm" variant="ghost" color="#4e6a7b" onClick={handleFormReset}>Reset Form</Button>
          </Flex>

        </Box>
      </Flex>
      
      <Modal isOpen={isSubmitting} onClose={() => {}} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
              <ModalBody>
                  <VStack spacing={4}>
                      <Spinner size="xl" color="#d0bdb5" thickness="4px" />
                      <Text color="white" fontSize="lg" fontWeight="600">
                          Calculating & Saving...
                      </Text>
                  </VStack>
              </ModalBody>
          </ModalContent>
      </Modal>
    </>
  );
}