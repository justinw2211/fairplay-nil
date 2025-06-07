import React from "react";
import { Box, Button, Heading, Input, FormControl, FormLabel, Stack, FormErrorMessage } from "@chakra-ui/react";

export default function FMVStep1({ formData, setFormData, errors, setErrors, onNext, onBack }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const stepErrors = {};
    if (!formData.division) stepErrors.division = "Division is required.";
    if (!formData.school) stepErrors.school = "School is required.";
    if (!formData.name) stepErrors.name = "Name is required.";
    if (!formData.email) stepErrors.email = "Email is required.";
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  return (
    <Box w="100%" maxW="lg" mx="auto" py={10}>
      <Heading size="lg" mb={6}>Profile & Academics</Heading>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.division}>
          <FormLabel>Division</FormLabel>
          <Input name="division" value={formData.division} onChange={handleChange} />
          <FormErrorMessage>{errors.division}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.school}>
          <FormLabel>School</FormLabel>
          <Input name="school" value={formData.school} onChange={handleChange} />
          <FormErrorMessage>{errors.school}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input name="email" value={formData.email} onChange={handleChange} />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>
      </Stack>
      <Stack direction="row" justify="space-between" mt={8}>
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button colorScheme="green" onClick={() => { if (validate()) onNext(); }}>Continue</Button>
      </Stack>
    </Box>
  );
}