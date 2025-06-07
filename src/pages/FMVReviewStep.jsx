import React from "react";
import {
  Box, Button, Flex, Heading, Stack, Text, Divider, SimpleGrid, Tag, useToast
} from "@chakra-ui/react";

export default function FMVReviewStep({
  formData, setFormData, goToStep
}) {
  const toast = useToast();

  const handleEdit = (stepIdx) => {
    goToStep(stepIdx);
  };

  const handleSubmit = () => {
    // (Future: Submit to backend here)
    toast({
      title: "Form submitted!",
      status: "success",
      duration: 1200,
      isClosable: true
    });
    // You may want to set a flag or route to a result page here
  };

  // If you have deliverables or deal details as arrays, use fallback/optional chaining
  return (
    <Flex minH="100vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}
    >
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={3}>Review & Confirm</Heading>
        <Text color="gray.300" mb={6}>
          Please review your responses below. Click <b>Edit</b> to modify any section.
        </Text>
        <Stack spacing={6}>
          {/* Profile Section */}
          <Box>
            <Flex align="center" justify="space-between" mb={2}>
              <Heading size="md">Athlete Profile</Heading>
              <Button size="sm" onClick={() => handleEdit(0)} colorScheme="green" variant="link">
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={2} spacing={1}>
              <Text color="gray.400">Division:</Text>
              <Text>{formData.division}</Text>
              <Text color="gray.400">School:</Text>
              <Text>{formData.school}</Text>
              <Text color="gray.400">Name:</Text>
              <Text>{formData.name}</Text>
              <Text color="gray.400">Email:</Text>
              <Text>{formData.email}</Text>
              <Text color="gray.400">Gender:</Text>
              <Text>{formData.gender}</Text>
              <Text color="gray.400">Sport:</Text>
              <Text>{formData.sport}</Text>
              <Text color="gray.400">Grad Year:</Text>
              <Text>{formData.graduation_year}</Text>
              <Text color="gray.400">GPA:</Text>
              <Text>{formData.gpa}</Text>
              <Text color="gray.400">Age:</Text>
              <Text>{formData.age}</Text>
              <Text color="gray.400">Prior NIL Deals:</Text>
              <Text>{formData.prior_nil_deals}</Text>
            </SimpleGrid>
          </Box>
          <Divider borderColor="gray.700" />
          {/* Deal Info Section */}
          <Box>
            <Flex align="center" justify="space-between" mb={2}>
              <Heading size="md">Deal Details</Heading>
              <Button size="sm" onClick={() => handleEdit(1)} colorScheme="green" variant="link">
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={2} spacing={1}>
              <Text color="gray.400">Deal Description:</Text>
              <Text>{formData.deal_description}</Text>
              <Text color="gray.400">Followers:</Text>
              <Text>{formData.followers}</Text>
              <Text color="gray.400">Deliverables:</Text>
              <Text>
                {formData.deliverables && formData.deliverables.length > 0
                  ? formData.deliverables.join(", ")
                  : ""}
              </Text>
              {/* Add more deal fields as needed */}
            </SimpleGrid>
          </Box>
        </Stack>
        <Flex mt={8} justify="flex-end">
          <Button colorScheme="green" px={8} fontWeight="bold" onClick={handleSubmit}>
            Submit
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
