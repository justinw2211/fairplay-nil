import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, useToast, Text, SimpleGrid, FormErrorMessage,
  Radio, RadioGroup
} from "@chakra-ui/react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

// Mock options - replace with real options if needed
const DELIVERABLES = [
  { label: "Instagram Post", value: "Instagram Post" },
  { label: "Instagram Story", value: "Instagram Story" },
  { label: "TikTok Video", value: "TikTok Video" },
  { label: "YouTube Video", value: "YouTube Video" },
  { label: "Other", value: "Other" }
];
const DEAL_TYPES = [
  { label: "Sponsorship", value: "Sponsorship" },
  { label: "Merchandise", value: "Merchandise" },
  { label: "Event", value: "Event" },
  { label: "Other", value: "Other" }
];

const STEPS = [
  { label: "Deal Details" },
  { label: "Deliverables" },
  { label: "Review & Submit" }
];

// Custom styles for react-select
const customMultiStyles = {
  control: (base) => ({
    ...base, background: "#222", color: "white", borderColor: "#555"
  }),
  multiValue: (base) => ({
    ...base, backgroundColor: "#3a3f47", borderRadius: "6px"
  }),
  multiValueLabel: (base) => ({
    ...base, color: "white", fontWeight: 600
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#88E788"
      : state.isFocused
      ? "#282c34"
      : "#23272f",
    color: state.isSelected
      ? "#1a1a1a"
      : "#fff"
  })
};

const initialFormData = {
  payment_structure: "",
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deal_category: "",
  brand_partner: "",
  deliverables: [],
  deliverables_other: "",
  deliverables_count: {},
  deal_type: [],
  is_real_submission: ""
};

function getStepLabel(step) {
  return STEPS[step] ? STEPS[step].label : "";
}

export default function FMVStep2({ formData, setFormData }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(
    () => (formData && formData.step2) || initialFormData
  );
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  // Sync back to main formData
  useEffect(() => {
    setFormData(f => ({ ...f, step2: localForm }));
    // eslint-disable-next-line
  }, [localForm]);

  const validateStep = () => {
    let stepErrors = {};
    // Basic required field validation for step 0
    if (step === 0) {
      if (!localForm.payment_structure)
        stepErrors.payment_structure = "Required.";
      if (
        localForm.payment_structure === "Other" &&
        !localForm.payment_structure_other.trim()
      )
        stepErrors.payment_structure_other = "Specify the structure.";
      if (!localForm.deal_length_months)
        stepErrors.deal_length_months = "Required.";
      if (!localForm.proposed_dollar_amount)
        stepErrors.proposed_dollar_amount = "Required.";
      if (!localForm.deal_category)
        stepErrors.deal_category = "Required.";
      if (!localForm.brand_partner)
        stepErrors.brand_partner = "Required.";
      if (!localForm.is_real_submission)
        stepErrors.is_real_submission = "Please select Yes or No.";
    }
    // Add more validation for other steps if needed
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 1800,
        isClosable: true,
        position: "top"
      });
      return;
    }
    if (step === STEPS.length - 1) {
      navigate("/fmvcalculator/review");
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const updateField = (field, value) => {
    setLocalForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  // Renderers for each step
  const renderDealDetails = () => (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Deal Details</Heading>
      <FormControl isRequired isInvalid={!!errors.payment_structure}>
        <FormLabel color="gray.200">Payment Structure</FormLabel>
        <Select
          options={[
            { label: "Flat Fee", value: "Flat Fee" },
            { label: "Per Post", value: "Per Post" },
            { label: "Commission", value: "Commission" },
            { label: "Other", value: "Other" }
          ]}
          value={localForm.payment_structure ? { label: localForm.payment_structure, value: localForm.payment_structure } : null}
          onChange={opt => updateField("payment_structure", opt ? opt.value : "")}
          placeholder="Select payment structure"
          styles={customMultiStyles}
        />
        <FormErrorMessage>{errors.payment_structure}</FormErrorMessage>
      </FormControl>
      {localForm.payment_structure === "Other" && (
        <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
          <FormLabel color="gray.200">Specify Other Structure</FormLabel>
          <Input
            value={localForm.payment_structure_other}
            onChange={e => updateField("payment_structure_other", e.target.value)}
            placeholder="Describe payment structure"
            bg="gray.800"
            style={{ color: "white" }}
          />
          <FormErrorMessage>{errors.payment_structure_other}</FormErrorMessage>
        </FormControl>
      )}
      <FormControl isRequired isInvalid={!!errors.deal_length_months}>
        <FormLabel color="gray.200">Deal Length (months)</FormLabel>
        <NumberInput
          value={localForm.deal_length_months}
          onChange={(_, v) => updateField("deal_length_months", v)}
          min={1} max={36}
        >
          <NumberInputField placeholder="e.g., 12" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
        <FormErrorMessage>{errors.deal_length_months}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
        <FormLabel color="gray.200">Total Proposed Dollar Amount</FormLabel>
        <NumberInput
          value={localForm.proposed_dollar_amount}
          onChange={(_, v) => updateField("proposed_dollar_amount", v)}
          min={1}
        >
          <NumberInputField placeholder="e.g., 5000" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
        <FormErrorMessage>{errors.proposed_dollar_amount}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.deal_category}>
        <FormLabel color="gray.200">Deal Category</FormLabel>
        <Select
          options={[
            { label: "Apparel", value: "Apparel" },
            { label: "Supplements", value: "Supplements" },
            { label: "Technology", value: "Technology" },
            { label: "Events", value: "Events" },
            { label: "Other", value: "Other" }
          ]}
          value={localForm.deal_category ? { label: localForm.deal_category, value: localForm.deal_category } : null}
          onChange={opt => updateField("deal_category", opt ? opt.value : "")}
          placeholder="Select category"
          styles={customMultiStyles}
        />
        <FormErrorMessage>{errors.deal_category}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.brand_partner}>
        <FormLabel color="gray.200">Brand Partner</FormLabel>
        <Input
          value={localForm.brand_partner}
          onChange={e => updateField("brand_partner", e.target.value)}
          placeholder="Brand or partner name"
          bg="gray.800"
          style={{ color: "white" }}
        />
        <FormErrorMessage>{errors.brand_partner}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.is_real_submission}>
        <FormLabel color="gray.200">Is this a real submission?</FormLabel>
        <RadioGroup
          value={localForm.is_real_submission}
          onChange={val => updateField("is_real_submission", val)}
        >
          <Stack direction="row">
            <Radio value="yes" colorScheme="green">Yes</Radio>
            <Radio value="no" colorScheme="green">No</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>{errors.is_real_submission}</FormErrorMessage>
      </FormControl>
    </Stack>
  );

  // Add more sections as needed for deliverables etc...

  const progress = ((step + 1) / STEPS.length) * 100;
  const progressLabel = `Step ${step + 1} of ${STEPS.length}: ${getStepLabel(step)}`;

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
        <Box mb={6}>
          <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">
            {progressLabel}
          </Text>
          <Progress
            value={progress}
            size="md"
            colorScheme="green"
            borderRadius="full"
            hasStripe
            isAnimated
            mb={2}
          />
        </Box>
        <form onSubmit={handleNext} autoComplete="off">
          <Stack spacing={6}>
            {step === 0 && renderDealDetails()}
            {/* Add further steps/components as needed */}
          </Stack>
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0}
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
              {step === STEPS.length - 1 ? "Continue" : "Next"}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
