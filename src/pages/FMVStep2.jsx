import React, { useState } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, RadioGroup, Radio,
  CheckboxGroup, Checkbox, Textarea, useToast, SimpleGrid, Text
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const DELIVERABLES = [
  "Instagram Post", "Instagram Story", "TikTok Video", "Twitter/X Post", "YouTube Video", "Appearance", "Other"
];
const DEAL_TYPES = ["Post", "Event", "Merch", "Apparel", "Content", "Other"];
const DEAL_CATEGORIES = ["Apparel", "Nutrition", "Event", "Social", "Charity", "Other"];
const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];
const STEPS = [
  "Deal Structure",
  "Deliverables",
  "Additional Details"
];

const initialFormData = {
  deliverables: [],
  deliverable_other: "",
  deliverables_count: {},
  payment_structure: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deal_type: [],
  deal_category: "",
  brand_partner: "",
  geography: "",
  is_real_submission: ""
};

export default function FMVStep2({ formData, setFormData }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(formData?.step2 || initialFormData);
  const [touched, setTouched] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  // Progress bar logic
  const progress = ((step + 1) / STEPS.length) * 100;

  // Validation per section
  const validateStep = () => {
    switch (step) {
      case 0:
        return (
          localForm.payment_structure &&
          localForm.deal_length_months &&
          localForm.proposed_dollar_amount
        );
      case 1:
        // Deliverables are OPTIONAL. If selected, quantity required.
        for (const del of localForm.deliverables || []) {
          if (del === "Other") {
            if (!localForm.deliverable_other.trim() || !localForm.deliverables_count["Other"]) return false;
          } else {
            if (!localForm.deliverables_count[del]) return false;
          }
        }
        return true;
      case 2:
        // Deal Type is OPTIONAL (multi-select). The rest required.
        return (
          localForm.deal_category &&
          localForm.brand_partner &&
          localForm.geography &&
          localForm.is_real_submission
        );
      default:
        return false;
    }
  };

  // Next/Back handlers
  const handleNext = () => {
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      setTouched((prev) => ({ ...prev, [step]: true }));
      return;
    }
    if (step === STEPS.length - 1) {
      if (typeof setFormData === "function") {
        setFormData({ ...formData, step2: localForm });
      }
      navigate("/fmvcalculator/result");
    } else {
      setStep((s) => s + 1);
    }
  };
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Centralized change handler
  const updateField = (field, value) => setLocalForm((prev) => ({ ...prev, [field]: value }));

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

  // Render sections
  const dealStructure = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Deal Structure</Heading>
      <FormControl isRequired>
        <FormLabel color="gray.200">Payment Structure</FormLabel>
        <RadioGroup
          colorScheme="green"
          value={localForm.payment_structure}
          onChange={v => {
            updateField("payment_structure", v);
            if (v === "One-time") updateField("deal_length_months", "1");
          }}
        >
          <Stack direction="row">
            <Radio value="One-time">One-time</Radio>
            <Radio value="Recurring">Recurring</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <FormControl isRequired>
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
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Proposed Dollar Amount</FormLabel>
        <NumberInput
          value={localForm.proposed_dollar_amount}
          onChange={(_, v) => updateField("proposed_dollar_amount", v)}
          min={1}
        >
          <NumberInputField placeholder="e.g., 2500" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
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
              <FormControl isRequired>
                <FormLabel color="gray.200">Please describe other deliverable</FormLabel>
                <Textarea
                  value={localForm.deliverable_other}
                  onChange={e => updateField("deliverable_other", e.target.value)}
                  placeholder="Describe your deliverable"
                  bg="gray.800"
                  style={{ color: "white" }}
                />
              </FormControl>
              <FormControl isRequired>
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
              </FormControl>
            </Stack>
          ) : (
            <FormControl isRequired>
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
      <FormControl isRequired>
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
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Brand Partner</FormLabel>
        <Input
          value={localForm.brand_partner}
          onChange={e => updateField("brand_partner", e.target.value)}
          placeholder="Nike, Adidas, etc."
          bg="gray.800"
          style={{ color: "white" }}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Geography (State)</FormLabel>
        <Select
          value={localForm.geography}
          onChange={e => updateField("geography", e.target.value)}
          placeholder="Select your home state"
          bg="gray.800"
          style={{ color: "white" }}
        >
          {STATES.map(state => <option key={state} value={state}>{state}</option>)}
        </Select>
      </FormControl>
      <FormControl isRequired>
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
        <form
          onSubmit={e => {
            e.preventDefault();
            handleNext();
          }}
        >
          {renderSection()}
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0}
              colorScheme="gray"
              variant="ghost"
            >
              Back
            </Button>
            <Button
              type="submit"
              colorScheme="green"
              px={8}
              fontWeight="bold"
            >
              {step === STEPS.length - 1 ? "Submit" : "Next"}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
