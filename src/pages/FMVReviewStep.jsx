import React from "react";
import {
  Box, Button, Flex, Heading, Stack, Text, Divider, SimpleGrid, Tag
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FMVReviewStep({ formData, setFormData }) {
  const navigate = useNavigate();

  // Helper for jumping to section
  const handleEdit = (section) => {
    // You can customize which route/step each section goes back to.
    if (section === "profile") navigate("/fmvcalculator");
    if (section === "deal") navigate("/fmvcalculator/step2");
  };

  const handleSubmit = () => {
    // (Add your backend submit logic here if desired)
    // For now, just go to results!
    navigate("/fmvcalculator/result");
  };

  // Section renderers
  const renderProfile = () => (
    <Box>
      <Flex align="center" justify="space-between" mb={2}>
        <Heading size="md">Athlete Profile</Heading>
        <Button size="sm" onClick={() => handleEdit("profile")} colorScheme="green" variant="link">
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
  );

  const renderSocial = () => (
    <Box mt={4}>
      <Heading size="md" mb={2}>Social Media & Achievements</Heading>
      {formData.social_platforms && formData.social_platforms.length > 0 && (
        <Box mb={2}>
          <Text color="gray.400" fontWeight="bold">Platforms:</Text>
          <Stack direction="row" flexWrap="wrap">
            {formData.social_platforms.map(platform => (
              <Tag key={platform} colorScheme="green" mb={1}>{platform}</Tag>
            ))}
          </Stack>
        </Box>
      )}
      {formData.followers_instagram && (
        <Text color="gray.400">Instagram followers: <b>{formData.followers_instagram}</b></Text>
      )}
      {formData.followers_tiktok && (
        <Text color="gray.400">TikTok followers: <b>{formData.followers_tiktok}</b></Text>
      )}
      {formData.followers_twitter && (
        <Text color="gray.400">Twitter/X followers: <b>{formData.followers_twitter}</b></Text>
      )}
      {formData.followers_youtube && (
        <Text color="gray.400">YouTube followers: <b>{formData.followers_youtube}</b></Text>
      )}
      {formData.achievements && formData.achievements.length > 0 && (
        <Box mt={2}>
          <Text color="gray.400" fontWeight="bold">Achievements:</Text>
          <Stack direction="row" flexWrap="wrap">
            {formData.achievements.map(a =>
              <Tag key={a} colorScheme="green" mb={1}>{a}</Tag>
            )}
          </Stack>
          {formData.achievements.includes("Other") && formData.achievement_other && (
            <Text color="gray.400" mt={1}>Other: <b>{formData.achievement_other}</b></Text>
          )}
        </Box>
      )}
    </Box>
  );

  const deal = formData.step2 || {};
  const renderDeal = () => (
    <Box mt={4}>
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
                    ? `${deal.deliverable_other} (${deal.deliverables_count["Other"] || 1})`
                    : deal.deliverables_count[del] || 1}
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
  );

  return (
    <Flex minH="100vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}
    >
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={3}>Review & Confirm</Heading>
        <Text color="gray.300" mb={6}>Please review your responses below. Click <b>Edit</b> to modify any section.</Text>
        <Stack spacing={6}>
          {renderProfile()}
          <Divider borderColor="gray.700" />
          {renderSocial()}
          <Divider borderColor="gray.700" />
          {renderDeal()}
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
