import React from "react";
import { Box, Button, Heading, Text, Stack } from "@chakra-ui/react";

export default function FMVReviewStep({ formData, onBack, onNext }) {
  return (
    <Box w="100%" maxW="lg" mx="auto" py={10}>
      <Heading size="lg" mb={6}>Review & Confirm</Heading>
      <Stack spacing={2} mb={8}>
        <Text><b>Division:</b> {formData.division}</Text>
        <Text><b>School:</b> {formData.school}</Text>
        <Text><b>Name:</b> {formData.name}</Text>
        <Text><b>Email:</b> {formData.email}</Text>
        <Text><b>Gender:</b> {formData.gender}</Text>
        <Text><b>Sport:</b> {formData.sport}</Text>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button colorScheme="green" onClick={onNext}>Submit</Button>
      </Stack>
    </Box>
  );
}