import React, { useState } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, RadioGroup, Radio,
  CheckboxGroup, Checkbox, Textarea, useToast, SimpleGrid, Text, FormErrorMessage
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const PAYMENT_STRUCTURES = [
  "One-time",
  "Recurring",
  "Pay per Post",
  "Pay per Milestone",
  "Pay per Appearance",
  "Other"
];

const DELIVERABLES = [
  "Instagram Post", "Instagram Story", "TikTok Video", "Twitter/X Post", "YouTube Video", "Appearance", "Other"
];

const DEAL_TYPES = ["Post", "Event", "Merch", "Apparel", "Content", "Other"];
const DEAL_CATEGORIES = ["Apparel", "Nutrition", "Event", "Social", "Charity", "Other"];
const STEPS = [
  "Deal Structure",
  "Deliverables",
  "Additional Details"
];

const initialFormData = {
  payment_structure: "",
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deliverables: [],
  deliverable_other: "",
  deliverables_count: {},
  deal_type: [],
  deal_category: "",
  brand_partner: "",
  is_real_submission: ""
};

export default function FMVStep2({ formData, setFormData }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(formData?.step2 || initialFormData);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  // Progress bar logic
  const progress = ((step + 1) / STEPS.length) * 100;

  // Validation per section
  const validateStep = () => {
    let stepErrors = {};
    if (step === 0) {
      if (!localForm.payment_structure) stepErrors.payment_structure = "Payment structure is required.";
      if (localForm.payment_structure === "Other" && !localForm.payment_structure_other.trim())
        stepErrors.payment_structure_other = "Please specify payment structure.";
      if (!localForm.deal_length_months)
        stepErrors.deal_length_months = "Deal length is required.";
      if (!localForm.proposed_dollar_amount)
        stepErrors.proposed_dollar_amount = "Total proposed dollar amount is required.";
    }
    if (step === 1) {
      for (const del of localForm.deliverables || []) {
        if (del === "Other") {
          if (!localForm.deliverable_other.trim())
            stepErrors.deliverable_other = "Please describe other deliverable.";
          if (!localForm.deliverables_count["Other"])
            stepErrors.deliverables_count_other = "Please specify quantity for 'Other'.";
        } else {
          if (!localForm.deliverables_count[del])
            stepErrors[`deliverables_count_${del}`] = `Quantity required for ${del}.`;
        }
      }
    }
    if (step === 2) {
      if (!localForm.deal_category)
        stepErrors.deal_category = "Deal category is required.";
      if (!localForm.brand_partner)
        stepErrors.brand_partner = "Brand partner is required.";
      if (!localForm.is_real_submission)
        stepErrors.is_real_submission = "Please specify if this is a real submission.";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Next/Back handlers
  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    if (step === STEPS.length - 1) {
      if (typeof setFormData === "function") {
        setFormData({ ...formData, step2: localForm });
      }
      navigate("/fmvcalculator/review");
    } else {
      setStep((s) => s + 1);
    }
  };
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Centralized change handler
  const updateField = (field, value) => {
    setLocalForm(prev => ({ ...prev, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  // Deliverable logic
  const handleDeliverablesChange = (selected) => {
    updateField("deliverables", selected);
    setLocalForm((prev) => {
      const newCounts = { ...prev.deliverables_count };
      Object.keys(newCounts).forEach((key) => {
        if (!selected.includes(key)) delete newCounts[key];
      });
      return { ...prev, deliverables_count: newCounts };
    });
    if (!selected.includes("Other")) updateField("deliverable_other", "");
  };

  // --- Section renderers ---
  const dealStructure = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Deal Structure</Heading>
      <FormControl isRequired isInvalid={!!errors.payment_structure}>
        <FormLabel color="gray.200">Payment Structure</FormLabel>
        <RadioGroup
          colorScheme="green"
          value={localForm.payment_structure}
          onChange={v => {
            updateField("payment_structure", v);
            if (v === "One-time") updateField("deal_length_months", "1");
            else updateField("deal_length_months", "");
          }}
        >
          <Stack direction="column" spacing={2}>
            {PAYMENT_STRUCTURES.map(opt => (
              <Radio key={opt} value={opt}>{opt}</Radio>
            ))}
          </Stack>
        </RadioGroup>
        <FormErrorMessage>{errors.payment_structure}</FormErrorMessage>
      </FormControl>
      {localForm.payment_structure === "Other" && (
        <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
          <FormLabel color="gray.200">Other (describe)</FormLabel>
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
        <FormLabel color="gray.200">Deal Length {localForm.payment_structure === "One-time" ? "(auto-filled for one-time)" : "(months)"}</FormLabel>
        <NumberInput
          value={localForm.deal_length_months}
          onChange={(_, v) => updateField("deal_length_months", v)}
          min={1}
          isDisabled={localForm.payment_structure === "One-time"}
        >
          <NumberInputField
            placeholder={localForm.payment_structure === "One-time" ? "1" : "e.g., 6"}
            bg="gray.800"
            style={{ color: "white" }}
          />
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
          <NumberInputField placeholder="e.g., 2500" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
        <FormErrorMessage>{errors.proposed_dollar_amount}</FormErrorMessage>
      </FormControl>
    </Stack>
  );

  const deliverablesSection = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Deliverables</Heading>
      <FormControl>
        <FormLabel color="gray.200">Which deliverables are included?</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={localForm.deliverables || []}
          onChange={handleDeliverablesChange}
        >
          <SimpleGrid columns={[1, 2]} spacing={2}>
            {DELIVERABLES.map(del => (
              <Checkbox key={del} value={del}>{del}</Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </FormControl>
      {(localForm.deliverables || []).map(del => (
        <Box key={del} mt={2}>
          {del === "Other" ? (
            <Stack spacing={2}>
              <FormControl isRequired isInvalid={!!errors.deliverable_other}>
                <FormLabel color="gray.200">Please describe other deliverable</FormLabel>
                <Textarea
                  value={localForm.deliverable_other}
                  onChange={e => updateField("deliverable_other", e.target.value)}
                  placeholder="Describe your deliverable"
                  bg="gray.800"
                  style={{ color: "white" }}
                />
                <FormErrorMessage>{errors.deliverable_other}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.deliverables_count_other}>
                <FormLabel color="gray.200">Quantity for Other Deliverable</FormLabel>
                <NumberInput
                  value={localForm.deliverables_count["Other"] || ""}
                  onChange={(_, v) =>
                    setLocalForm(prev => ({
                      ...prev,
                      deliverables_count: { ...prev.deliverables_count, ["Other"]: v }
                    }))
                  }
                  min={1}
                >
                  <NumberInputField placeholder="e.g., 2" bg="gray.800" style={{ color: "white" }} />
                </NumberInput>
                <FormErrorMessage>{errors.deliverables_count_other}</FormErrorMessage>
              </FormControl>
            </Stack>
          ) : (
            <FormControl isRequired isInvalid={!!errors[`deliverables_count_${del}`]}>
              <FormLabel color="gray.200">
                Quantity for {del}
              </FormLabel>
              <NumberInput
                value={localForm.deliverables_count[del] || ""}
                onChange={(_, v) =>
                  setLocalForm(prev => ({
                    ...prev,
                    deliverables_count: { ...prev.deliverables_count, [del]: v }
                  }))
                }
                min={1}
              >
                <NumberInputField placeholder="e.g., 3" bg="gray.800" style={{ color: "white" }} />
              </NumberInput>
              <FormErrorMessage>{errors[`deliverables_count_${del}`]}</FormErrorMessage>
            </FormControl>
          )}
        </Box>
      ))}
    </Stack>
  );

  const additionalDetails = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Additional Details</Heading>
      <FormControl>
        <FormLabel color="gray.200">Deal Type</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={localForm.deal_type || []}
          onChange={v => updateField("deal_type", v)}
        >
          <SimpleGrid columns={[1, 2]} spacing={2}>
            {DEAL_TYPES.map(type => (
              <Checkbox key={type} value={type}>{type}</Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.deal_category}>
        <FormLabel color="gray.200">Deal Category</FormLabel>
        <Select
          value={localForm.deal_category}
          onChange={e => updateField("deal_category", e.target.value)}
          placeholder="Select category"
          bg="gray.800"
          style={{ color: "white" }}
        >
          {DEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <FormErrorMessage>{errors.deal_category}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.brand_partner}>
        <FormLabel color="gray.200">Brand Partner</FormLabel>
        <Input
          value={localForm.brand_partner}
          onChange={e => updateField("brand_partner", e.target.value)}
          placeholder="Nike, Adidas, etc."
          bg="gray.800"
          style={{ color: "white" }}
        />
        <FormErrorMessage>{errors.brand_partner}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.is_real_submission}>
        <FormLabel color="gray.200">Is this a real submission?</FormLabel>
        <RadioGroup
          colorScheme="green"
          value={localForm.is_real_submission}
          onChange={v => updateField("is_real_submission", v)}
        >
          <Stack direction="row">
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No (test/demo)</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>{errors.is_real_submission}</FormErrorMessage>
      </FormControl>
    </Stack>
  );

  const renderSection = () => {
    switch (step) {
      case 0: return dealStructure;
      case 1: return deliverablesSection;
      case 2: return additionalDetails;
      default: return dealStructure;
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
        <Box mb={6}>
          <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </Text>
          <Progress value={progress} size="sm" colorScheme="green" borderRadius="lg" />
        </Box>
        <form onSubmit={handleNext}>
          {renderSection()}
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0}
              colorScheme="gray"
              variant="outline"
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
