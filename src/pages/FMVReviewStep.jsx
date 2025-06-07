import React from "react";
import {
  Box, Button, Flex, Heading, Stack, Text, Divider, SimpleGrid, Tag, useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FMVReviewStep({ formData, onBack, onSubmit }) {
  const navigate = useNavigate();
  const toast = useToast();

  // Everything from FMVStep1 and FMVStep2 is combined in formData
  const deal = formData?.step2 || {};
  const profile = { ...formData };
  delete profile.step2; // Don’t show step2 as a nested object

  const handleEdit = (section) => {
    if (section === "profile") navigate("/fmvcalculator/step1");
    if (section === "deal") navigate("/fmvcalculator/step2");
  };

  const handleFinalSubmit = () => {
    toast({
      title: "Form submitted!",
      status: "success",
      duration: 1200,
      isClosable: true
    });
    if (onSubmit) onSubmit();
    else navigate("/fmvcalculator/result");
  };

  return (
    <Flex minH="100vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}
    >
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={3}>Review & Confirm</Heading>
        <Text color="gray.300" mb={6}>Please review your responses below. Click <b>Edit</b> to modify any section.</Text>
        <Stack spacing={6}>
          {/* Profile */}
          <Box>
            <Flex align="center" justify="space-between" mb={2}>
              <Heading size="md">Athlete Profile</Heading>
              <Button size="sm" onClick={() => handleEdit("profile")} colorScheme="green" variant="link">
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={2} spacing={1}>
              <Text color="gray.400">Division:</Text>
              <Text>{profile.division}</Text>
              <Text color="gray.400">School:</Text>
              <Text>{profile.school}</Text>
              <Text color="gray.400">Name:</Text>
              <Text>{profile.name}</Text>
              <Text color="gray.400">Email:</Text>
              <Text>{profile.email}</Text>
              <Text color="gray.400">Gender:</Text>
              <Text>{profile.gender}</Text>
              <Text color="gray.400">Sport:</Text>
              <Text>{profile.sport}</Text>
              <Text color="gray.400">Grad Year:</Text>
              <Text>{profile.graduation_year}</Text>
              <Text color="gray.400">GPA:</Text>
              <Text>{profile.gpa}</Text>
              <Text color="gray.400">Age:</Text>
              <Text>{profile.age}</Text>
              <Text color="gray.400">Prior NIL Deals:</Text>
              <Text>{profile.prior_nil_deals}</Text>
            </SimpleGrid>
          </Box>
          <Divider borderColor="gray.700" />
          {/* Deal Info */}
          <Box>
            <Flex align="center" justify="space-between" mb={2}>
              <Heading size="md">Deal Details</Heading>
              <Button size="sm" onClick={() => handleEdit("deal")} colorScheme="green" variant="link">
                Edit
              </Button>
            </Flex>
            <SimpleGrid columns={2} spacing={1}>
              <Text color="gray.400">Payment Structure:</Text>
              <Text>
                {deal.payment_structure}
                {deal.payment_structure === "Other" && deal.payment_structure_other
                  ? ` (${deal.payment_structure_other})`
                  : ""}
              </Text>
              <Text color="gray.400">Deal Length:</Text>
              <Text>{deal.deal_length_months} month(s)</Text>
              <Text color="gray.400">Total Proposed $:</Text>
              <Text>{deal.proposed_dollar_amount}</Text>
              <Text color="gray.400">Deal Category:</Text>
              <Text>{deal.deal_category}</Text>
              <Text color="gray.400">Brand Partner:</Text>
              <Text>{deal.brand_partner}</Text>
              <Text color="gray.400">Is Real Submission:</Text>
              <Text>{deal.is_real_submission === "yes" ? "Yes" : "Test/Demo"}</Text>
            </SimpleGrid>
            {deal.deliverables && deal.deliverables.length > 0 && (
              <Box mt={3}>
                <Text color="gray.400" fontWeight="bold">Deliverables:</Text>
                <Stack direction="row" flexWrap="wrap">
                  {deal.deliverables.map(del => (
                    <Tag key={del} colorScheme="green" mb={1}>{del}</Tag>
                  ))}
                </Stack>
                <SimpleGrid columns={2} spacing={1} mt={2}>
                  {deal.deliverables.map(del => (
                    <React.Fragment key={del}>
                      <Text color="gray.400">{del === "Other" ? "Other (desc):" : `${del} qty:`}</Text>
                      <Text>
                        {del === "Other"
                          ? `${deal.deliverable_other} (${deal.deliverables_count?.[del] || 1})`
                          : deal.deliverables_count?.[del] || 1}
                      </Text>
                    </React.Fragment>
                  ))}
                </SimpleGrid>
              </Box>
            )}
            {deal.deal_type && deal.deal_type.length > 0 && (
              <Box mt={2}>
                <Text color="gray.400" fontWeight="bold">Deal Types:</Text>
                <Stack direction="row" flexWrap="wrap">
                  {deal.deal_type.map(type => (
                    <Tag key={type} colorScheme="green" mb={1}>{type}</Tag>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
        <Flex mt={8} justify="space-between">
          <Button colorScheme="gray" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button colorScheme="green" px={8} fontWeight="bold" onClick={handleFinalSubmit}>
            Submit
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
