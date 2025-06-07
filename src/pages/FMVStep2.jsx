import React, { useState, useEffect } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  NumberInput, NumberInputField, useToast, Text, SimpleGrid, Input, FormErrorMessage, Radio, RadioGroup
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const PAYMENT_OPTIONS = [
  { label: "One-time", value: "One-time" },
  { label: "Recurring", value: "Recurring" },
  { label: "Pay Per Post", value: "Pay Per Post" },
  { label: "Commission-Based", value: "Commission-Based" },
  { label: "In-Kind (Product Only)", value: "In-Kind (Product Only)" },
  { label: "Other", value: "Other" }
];
const DELIVERABLES = [
  "Instagram Post", "Instagram Story", "TikTok Video", "Tweet", "YouTube Video",
  "Event Appearance", "Autograph Session", "Podcast", "Other"
];
const DEAL_TYPES = [
  "Sponsorship", "Ambassador", "Content Only", "Product Only", "Social Only", "Other"
];
const DEAL_CATEGORIES = [
  "Apparel", "Equipment", "Nutrition", "Financial", "Technology", "Collective", "Other"
];

const STEPS = [
  { label: "Deal Info" }
];

const initialFormData = {
  payment_structure: "",
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deliverables: [],
  deliverables_count: {},
  deliverable_other: "",
  deal_type: [],
  deal_category: "",
  brand_partner: "",
  is_real_submission: "",
};

export default function FMVStep2({ formData, setFormData }) {
  // Load step2 form from formData or localStorage if available
  const [localForm, setLocalForm] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fpn_deal")) || (formData.step2 || initialFormData);
    } catch {
      return formData.step2 || initialFormData;
    }
  });
  const [step] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem("fpn_deal", JSON.stringify(localForm));
  }, [localForm]);

  useEffect(() => {
    // Resume draft logic (basic MVP)
    if (window.location.hash === "#resume") {
      const saved = localStorage.getItem("fpn_deal");
      if (saved) setLocalForm(JSON.parse(saved));
    }
  }, []);

  // Ensure "Other" fields cleared when option removed
  useEffect(() => {
    if (!localForm.deliverables.includes("Other")) {
      setLocalForm(f => ({ ...f, deliverable_other: "" }));
    }
    if (localForm.payment_structure !== "Other") {
      setLocalForm(f => ({ ...f, payment_structure_other: "" }));
    }
  }, [localForm.deliverables, localForm.payment_structure]);

  // Validation
  const validateStep = () => {
    let errs = {};
    if (!localForm.payment_structure) errs.payment_structure = "Payment structure is required.";
    if (localForm.payment_structure === "Other" && !localForm.payment_structure_other)
      errs.payment_structure_other = "Please specify payment structure.";
    if (!localForm.deal_length_months || localForm.deal_length_months < 1)
      errs.deal_length_months = "Deal length required.";
    if (!localForm.proposed_dollar_amount || Number(localForm.proposed_dollar_amount) < 1)
      errs.proposed_dollar_amount = "Total Proposed Dollar Amount is required.";
    if (localForm.deliverables.includes("Other") && !localForm.deliverable_other)
      errs.deliverable_other = "Please specify other deliverable.";
    // Deliverable counts must be numeric and >0 if deliverable selected
    for (let del of localForm.deliverables) {
      if (
        !localForm.deliverables_count[del] ||
        isNaN(localForm.deliverables_count[del]) ||
        Number(localForm.deliverables_count[del]) < 1
      ) {
        errs[`deliverables_count_${del}`] = `Count for "${del}" required (must be 1 or more).`;
      }
    }
    if (!localForm.deal_category) errs.deal_category = "Deal category required.";
    if (!localForm.brand_partner) errs.brand_partner = "Brand partner required.";
    if (!localForm.is_real_submission) errs.is_real_submission = "Please select if this is a real or test submission.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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
      setTouched(t => ({ ...t, [step]: true }));
      return;
    }
    // Save to parent formData and move to review
    setFormData(f => ({ ...f, step2: localForm }));
    navigate("/fmvcalculator/review");
  };

  const handleBack = () => {
    navigate("/fmvcalculator/step1");
  };

  const updateField = (field, value) => {
    setLocalForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  // For react-select multi
  const handleDeliverablesChange = selected => {
    const vals = selected ? selected.map(v => v.value) : [];
    updateField("deliverables", vals);
    // Remove counts for deselected deliverables
    setLocalForm(f => {
      const newCounts = { ...f.deliverables_count };
      for (const key of Object.keys(newCounts)) {
        if (!vals.includes(key)) delete newCounts[key];
      }
      return { ...f, deliverables_count: newCounts };
    });
  };

  // For react-select multi (deal_type)
  const handleDealTypeChange = selected => {
    const vals = selected ? selected.map(v => v.value) : [];
    updateField("deal_type", vals);
  };

  // Custom styles for react-select multi
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: "#222",
      color: "white",
      borderColor: "#555"
    }),
    singleValue: (base) => ({ ...base, color: "white" }),
    input: (base) => ({ ...base, color: "white" }),
    menu: (base) => ({ ...base, background: "#23272f", color: "#fff" }),
    option: (base, state) => ({
      ...base,
      color: state.isSelected ? "#88E788" : "white",
      background: state.isFocused ? "#262c32" : "#23272f"
    }),
    multiValue: (base) => ({
      ...base,
      background: "#353b42"
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      fontWeight: 600
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#88E788",
      ':hover': { background: '#23272f', color: 'white' }
    }),
    placeholder: (base) => ({
      ...base,
      color: "gray"
    })
  };

  const progress = 67; // e.g. Step 2 of 3
  const progressLabel = `Step 2 of 3: Deal Info`;

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
            <Heading fontSize="2xl" color="white">Deal Info</Heading>
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabel color="gray.200">Payment Structure</FormLabel>
              <Select
                options={PAYMENT_OPTIONS}
                value={localForm.payment_structure ? PAYMENT_OPTIONS.find(opt => opt.value === localForm.payment_structure) : null}
                onChange={selected => updateField("payment_structure", selected ? selected.value : "")}
                placeholder="Select payment structure"
                styles={selectStyles}
              />
              {localForm.payment_structure === "Other" && (
                <Input
                  mt={2}
                  bg="gray.800"
                  color="white"
                  placeholder="Describe payment structure"
                  value={localForm.payment_structure_other}
                  onChange={e => updateField("payment_structure_other", e.target.value)}
                />
              )}
              <FormErrorMessage>{errors.payment_structure || errors.payment_structure_other}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deal_length_months}>
              <FormLabel color="gray.200">Deal Length (months)</FormLabel>
              <NumberInput
                value={localForm.deal_length_months}
                onChange={(_, v) => updateField("deal_length_months", v)}
                min={1} max={60} step={1}
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
                min={1} step={1}
                precision={2}
              >
                <NumberInputField placeholder="e.g., 1000" bg="gray.800" style={{ color: "white" }} />
              </NumberInput>
              <FormErrorMessage>{errors.proposed_dollar_amount}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.200">Deliverables (select all that apply)</FormLabel>
              <Select
                isMulti
                options={DELIVERABLES.map(d => ({ label: d, value: d }))}
                value={localForm.deliverables.map(d => ({ label: d, value: d }))}
                onChange={handleDeliverablesChange}
                placeholder="Choose deliverables"
                styles={selectStyles}
              />
              {localForm.deliverables.includes("Other") && (
                <Input
                  mt={2}
                  bg="gray.800"
                  color="white"
                  placeholder="Describe other deliverable"
                  value={localForm.deliverable_other}
                  onChange={e => updateField("deliverable_other", e.target.value)}
                />
              )}
              <FormErrorMessage>{errors.deliverable_other}</FormErrorMessage>
              {(localForm.deliverables || []).map(del => (
                <FormControl key={del} isRequired isInvalid={!!errors[`deliverables_count_${del}`]}>
                  <FormLabel color="gray.400" fontSize="sm" mt={2}>{del} Quantity</FormLabel>
                  <NumberInput
                    min={1}
                    value={localForm.deliverables_count[del] || ""}
                    onChange={(_, v) => setLocalForm(f => ({
                      ...f,
                      deliverables_count: { ...f.deliverables_count, [del]: v }
                    }))}
                  >
                    <NumberInputField placeholder="1" bg="gray.800" style={{ color: "white" }} />
                  </NumberInput>
                  <FormErrorMessage>{errors[`deliverables_count_${del}`]}</FormErrorMessage>
                </FormControl>
              ))}
            </FormControl>

            <FormControl>
              <FormLabel color="gray.200">Deal Type (select all that apply)</FormLabel>
              <Select
                isMulti
                options={DEAL_TYPES.map(d => ({ label: d, value: d }))}
                value={localForm.deal_type.map(d => ({ label: d, value: d }))}
                onChange={handleDealTypeChange}
                placeholder="Choose deal type"
                styles={selectStyles}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deal_category}>
              <FormLabel color="gray.200">Deal Category</FormLabel>
              <Select
                options={DEAL_CATEGORIES.map(d => ({ label: d, value: d }))}
                value={localForm.deal_category ? { label: localForm.deal_category, value: localForm.deal_category } : null}
                onChange={selected => updateField("deal_category", selected ? selected.value : "")}
                placeholder="Select category"
                styles={selectStyles}
              />
              <FormErrorMessage>{errors.deal_category}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.brand_partner}>
              <FormLabel color="gray.200">Brand Partner</FormLabel>
              <Input
                value={localForm.brand_partner}
                onChange={e => updateField("brand_partner", e.target.value)}
                placeholder="e.g., Nike"
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
                <SimpleGrid columns={[1, 2]} spacing={2}>
                  <Radio value="yes" colorScheme="green" sx={{ color: "white" }}>Yes</Radio>
                  <Radio value="no" colorScheme="green" sx={{ color: "white" }}>No (Test/Demo Only)</Radio>
                </SimpleGrid>
              </RadioGroup>
              <FormErrorMessage>{errors.is_real_submission}</FormErrorMessage>
            </FormControl>
          </Stack>
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
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
        <Flex mt={3} justify="space-between" align="center">
          <Button
            size="sm"
            colorScheme="gray"
            variant="ghost"
            style={{ color: "#88E788" }}
            onClick={() => {
              localStorage.setItem("fpn_deal", JSON.stringify(initialFormData));
              setLocalForm(initialFormData);
              setTouched({});
              setErrors({});
              toast({
                title: "Deal form reset!",
                status: "info",
                duration: 1200,
                isClosable: true
              });
            }}
          >
            Reset Form
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            variant="ghost"
            style={{ color: "#88E788" }}
            onClick={() => {
              toast({
                title: "Resume link copied!",
                status: "success",
                duration: 1500,
                isClosable: true
              });
              navigator.clipboard.writeText(window.location.href + "#resume");
            }}
          >
            Save Progress & Get Link
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
