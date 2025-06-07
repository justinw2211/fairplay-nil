import React from "react";
import { Box, Button, Heading, Input, FormControl, FormLabel, Stack, FormErrorMessage } from "@chakra-ui/react";

export default function FMVStep2({ formData, setFormData, errors, setErrors, onNext, onBack }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const stepErrors = {};
    // Add validations as needed
    if (!formData.gender) stepErrors.gender = "Gender is required.";
    if (!formData.sport) stepErrors.sport = "Sport is required.";
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  return (
    <Box w="100%" maxW="lg" mx="auto" py={10}>
      <Heading size="lg" mb={6}>Deal Details</Heading>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.gender}>
          <FormLabel>Gender</FormLabel>
          <Input name="gender" value={formData.gender} onChange={handleChange} />
          <FormErrorMessage>{errors.gender}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.sport}>
          <FormLabel>Sport</FormLabel>
          <Input name="sport" value={formData.sport} onChange={handleChange} />
          <FormErrorMessage>{errors.sport}</FormErrorMessage>
        </FormControl>
      </Stack>
      <Stack direction="row" justify="space-between" mt={8}>
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button colorScheme="green" onClick={() => { if (validate()) onNext(); }}>Continue</Button>
      </Stack>
    </Box>
  );
}