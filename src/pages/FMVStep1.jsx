import React, { useRef, useEffect } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, useToast, Text, FormErrorMessage
} from "@chakra-ui/react";
import Select from "react-select";
import { NCAA_SCHOOL_OPTIONS } from "../data/ncaaSchools.js";

const DIVISIONS = ["I", "II", "III"];
const GENDERS = [
  "Male", "Female", "Nonbinary", "Prefer not to say", "Other"
];
const SPORTS = {
  "Male": [
    "Basketball", "Football", "Baseball", "Soccer", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Female": [
    "Basketball", "Soccer", "Volleyball", "Softball", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Nonbinary": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
  "Prefer not to say": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
  "Other": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
};

function isGPAValid(val) {
  if (val === "") return true;
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0 && num <= 4 && /^\d(\.\d{1,2})?$|^4(\.00?)?$/.test(val);
}

export default function FMVStep1({
  formData, setFormData, errors, setErrors, onNext, onBack, currentStepIdx, totalSteps
}) {
  const toast = useToast();
  const gpaInputRef = useRef(null);

  // --- School Options ---
  const schoolOptions = formData.division
    ? NCAA_SCHOOL_OPTIONS.filter(o => o.division === formData.division)
    : [];

  // GPA validation focus
  useEffect(() => {
    if (errors?.gpa && gpaInputRef.current) gpaInputRef.current.focus();
  }, [errors?.gpa]);

  // GPA logic
  const handleGPAChange = (value) => {
    if (value === "" || /^\d{0,1}(\.\d{0,2})?$/.test(value)) {
      setFormData(f => ({ ...f, gpa: value }));
      setErrors(e => ({ ...e, gpa: undefined }));
    }
  };

  const handleGPABlur = () => {
    let val = formData.gpa;
    if (val === "") return;
    if (/^\d{3}$/.test(val)) {
      val = `${val[0]}.${val.slice(1)}`;
    }
    val = val.replace(/^0+(\d)/, "$1");
    let num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 4) {
      setFormData(f => ({ ...f, gpa: "" }));
      setErrors(e => ({ ...e, gpa: "GPA must be 0.00–4.00" }));
    } else {
      setFormData(f => ({ ...f, gpa: num.toFixed(2) }));
      setErrors(e => ({ ...e, gpa: undefined }));
    }
  };

  // --- Validation ---
  const validate = () => {
    let stepErrors = {};
    if (!formData.division) stepErrors.division = "Division is required.";
    if (!formData.school) stepErrors.school = "School is required.";
    if (!formData.name.trim()) stepErrors.name = "Full name is required.";
    if (!formData.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      stepErrors.email = "Valid email is required.";
    if (!formData.gender) stepErrors.gender = "Gender is required.";
    if (!formData.sport) stepErrors.sport = "Sport is required.";
    if (!formData.graduation_year) stepErrors.graduation_year = "Graduation year is required.";
    if (formData.gpa !== "" && !isGPAValid(formData.gpa))
      stepErrors.gpa = "GPA must be a number between 0.00 and 4.00 (two decimals).";
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // --- Handlers ---
  const handleContinue = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    setErrors({});
    onNext();
  };

  const updateField = (field, value) => {
    setFormData(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  // School select handler
  const handleSchoolChange = (selected) => {
    updateField("school", selected ? selected.label : "");
  };

  return (
    <Box>
      <form onSubmit={handleContinue} autoComplete="off">
        <Stack spacing={6}>
          <Heading fontSize="2xl" color="white" mb={2}>Profile, Academics & Athletics</Heading>

          {/* Progress Bar */}
          <Box>
            <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">
              Step {currentStepIdx + 1} of {totalSteps}
            </Text>
            <Progress
              value={((currentStepIdx + 1) / totalSteps) * 100}
              size="md"
              colorScheme="green"
              borderRadius="full"
              hasStripe
              isAnimated
              mb={2}
            />
          </Box>

          {/* Division */}
          <FormControl isRequired isInvalid={!!errors.division}>
            <FormLabel color="gray.200">Division</FormLabel>
            <Select
              options={DIVISIONS.map(d => ({ label: d, value: d }))}
              value={formData.division ? { label: formData.division, value: formData.division } : null}
              onChange={selected => {
                updateField("division", selected ? selected.value : "");
                updateField("school", "");
              }}
              placeholder="Select division"
              styles={{
                control: (base) => ({
                  ...base,
                  background: "#222", color: "white", borderColor: "#555"
                }),
                singleValue: (base) => ({ ...base, color: "white" }),
                input: (base) => ({ ...base, color: "white" }),
                menu: (base) => ({ ...base, background: "#23272f", color: "#fff" })
              }}
            />
            <FormErrorMessage>{errors.division}</FormErrorMessage>
          </FormControl>

          {/* School */}
          <FormControl isRequired isInvalid={!!errors.school}>
            <FormLabel color="gray.200">School</FormLabel>
            <Select
              options={schoolOptions}
              value={formData.school ? { label: formData.school, value: formData.school } : null}
              onChange={handleSchoolChange}
              placeholder="Type to search your school..."
              isClearable
              isSearchable
              styles={{
                control: (base) => ({
                  ...base,
                  background: "#222", color: "white", borderColor: "#555"
                }),
                singleValue: (base) => ({ ...base, color: "white" }),
                input: (base) => ({ ...base, color: "white" }),
                menu: (base) => ({ ...base, background: "#23272f", color: "#fff" })
              }}
            />
            <FormErrorMessage>{errors.school}</FormErrorMessage>
          </FormControl>

          {/* Name */}
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel color="gray.200">Full Name</FormLabel>
            <Input
              value={formData.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder="Your Name"
              bg="gray.800"
              style={{ color: "white" }}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          {/* Email */}
          <FormControl isRequired isInvalid={!!errors.email}>
            <FormLabel color="gray.200">Email</FormLabel>
            <Input
              type="email"
              value={formData.email}
              onChange={e => updateField("email", e.target.value)}
              placeholder="you@email.com"
              bg="gray.800"
              style={{ color: "white" }}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {/* Gender */}
          <FormControl isRequired isInvalid={!!errors.gender}>
            <FormLabel color="gray.200">Gender</FormLabel>
            <Select
              options={GENDERS.map(g => ({ label: g, value: g }))}
              value={formData.gender ? { label: formData.gender, value: formData.gender } : null}
              onChange={selected => {
                updateField("gender", selected ? selected.value : "");
                updateField("sport", "");
              }}
              placeholder="Select gender"
              styles={{
                control: (base) => ({
                  ...base,
                  background: "#222", color: "white", borderColor: "#555"
                }),
                singleValue: (base) => ({ ...base, color: "white" }),
                input: (base) => ({ ...base, color: "white" }),
                menu: (base) => ({ ...base, background: "#23272f", color: "#fff" })
              }}
            />
            <FormErrorMessage>{errors.gender}</FormErrorMessage>
          </FormControl>

          {/* Sport */}
          <FormControl isRequired isInvalid={!!errors.sport}>
            <FormLabel color="gray.200">Sport</FormLabel>
            <Select
              options={formData.gender ? (SPORTS[formData.gender] || []).map(s => ({ label: s, value: s })) : []}
              value={formData.sport ? { label: formData.sport, value: formData.sport } : null}
              onChange={selected => updateField("sport", selected ? selected.value : "")}
              placeholder="Select sport"
              isDisabled={!formData.gender}
              styles={{
                control: (base) => ({
                  ...base,
                  background: "#222", color: "white", borderColor: "#555"
                }),
                singleValue: (base) => ({ ...base, color: "white" }),
                input: (base) => ({ ...base, color: "white" }),
                menu: (base) => ({ ...base, background: "#23272f", color: "#fff" })
              }}
            />
            <FormErrorMessage>{errors.sport}</FormErrorMessage>
          </FormControl>

          {/* Graduation Year */}
          <FormControl isRequired isInvalid={!!errors.graduation_year}>
            <FormLabel color="gray.200">Graduation Year</FormLabel>
            <NumberInput
              value={formData.graduation_year}
              onChange={(_, v) => updateField("graduation_year", v)}
              min={2024} max={2030}
            >
              <NumberInputField placeholder="2026" bg="gray.800" style={{ color: "white" }} />
            </NumberInput>
            <FormErrorMessage>{errors.graduation_year}</FormErrorMessage>
          </FormControl>

          {/* GPA (optional) */}
          <FormControl isInvalid={!!errors.gpa}>
            <FormLabel color="gray.200">GPA (optional)</FormLabel>
            <Input
              ref={gpaInputRef}
              value={formData.gpa}
              onChange={e => handleGPAChange(e.target.value)}
              onBlur={handleGPABlur}
              placeholder="e.g., 3.78"
              bg="gray.800"
              style={{ color: "white" }}
              inputMode="decimal"
            />
            <Text color="gray.400" fontSize="sm" mt={1}>Enter as 0.00 – 4.00 (two decimals)</Text>
            <FormErrorMessage>{errors.gpa}</FormErrorMessage>
          </FormControl>

          {/* Age (optional) */}
          <FormControl>
            <FormLabel color="gray.200">Age (optional)</FormLabel>
            <NumberInput
              value={formData.age}
              onChange={(_, v) => updateField("age", v)}
              min={15} max={30}
            >
              <NumberInputField placeholder="e.g., 20" bg="gray.800" style={{ color: "white" }} />
            </NumberInput>
          </FormControl>

          {/* Prior NIL Deals (optional) */}
          <FormControl>
            <FormLabel color="gray.200">Prior NIL Deals (optional)</FormLabel>
            <NumberInput
              value={formData.prior_nil_deals}
              onChange={(_, v) => updateField("prior_nil_deals", v)}
              min={0}
            >
              <NumberInputField placeholder="e.g., 2" bg="gray.800" style={{ color: "white" }} />
            </NumberInput>
          </FormControl>
        </Stack>

        {/* Navigation Buttons */}
        <Flex mt={8} justify="space-between">
          <Button
            onClick={onBack}
            isDisabled={currentStepIdx === 0}
            colorScheme="green"
            variant="outline"
            style={{ color: "#fff", borderColor: "#88E788" }}
            _hover={{ bg: "#23272f", color: "#88E788", borderColor: "#88E788" }}
          >
            Back
          </Button>
          <Button
            type="submit"
            colorScheme="green"
            px={8}
            fontWeight="bold"
          >
            Continue
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
