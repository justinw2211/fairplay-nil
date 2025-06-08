import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  Divider,
  SimpleGrid,
  Tag,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FMVReviewStep({ formData, setFormData }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (section) => {
    if (section === "profile") navigate("/fmvcalculator/step1");
    if (section === "deal") navigate("/fmvcalculator/step2");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("https://fairplay-nil-backend.onrender.com/api/fmv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unknown error occurred");
      }

      setFormData({ ...formData, fmv: data.fmv });
      navigate("/fmvcalculator/result");
    } catch (err) {
      toast({
        title: "Error submitting form",
        description: err.message || "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)"
      color="white"
      py={10}
    >
      <Box
        w={["95vw", "600px"]}
        bg="gray.900"
        boxShadow="2xl"
        borderRadius="2xl"
        p={[4, 8]}
        mx="auto"
      >
        <Heading size="lg" mb={4}>Review & Confirm</Heading>
        <Text color="gray.300" mb={6}>
          Please review your responses below. Click <b>Edit</b> to modify any section.
        </Text>

        <Stack spacing={6}>
          <Box>
            <Flex justify="space-between" mb={2} align="center">
              <Heading size="md">Athlete Profile</Heading>
              <Button size="sm" colorScheme="green" variant="link" onClick={() => handleEdit("profile")}>
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={2} spacing={2}>
              <Text color="gray.400">Division:</Text>
              <Text>{formData.division || "-"}</Text>
              <Text color="gray.400">School:</Text>
              <Text>{formData.school || "-"}</Text>
              <Text color="gray.400">Name:</Text>
              <Text>{formData.name || "-"}</Text>
              <Text color="gray.400">Email:</Text>
              <Text>{formData.email || "-"}</Text>
              <Text color="gray.400">Gender:</Text>
              <Text>{formData.gender || "-"}</Text>
              <Text color="gray.400">Sport:</Text>
              <Text>{formData.sport || "-"}</Text>
              <Text color="gray.400">Graduation Year:</Text>
              <Text>{formData.graduation_year || "-"}</Text>
              <Text color="gray.400">GPA:</Text>
              <Text>{formData.gpa || "-"}</Text>
              <Text color="gray.400">Age:</Text>
              <Text>{formData.age || "-"}</Text>
              <Text color="gray.400">Prior NIL Deals:</Text>
              <Text>{formData.prior_nil_deals || "-"}</Text>
            </SimpleGrid>
          </Box>

          {/* Future: Add deal details section here if applicable */}
        </Stack>

        <Flex mt={8} justify="flex-end">
          <Button
            colorScheme="green"
            px={8}
            fontWeight="bold"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting"
          >
            Submit
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
