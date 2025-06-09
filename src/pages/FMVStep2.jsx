import React, { useState, useEffect } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, useToast, Text, Select as ChakraSelect, FormErrorMessage
} from "@chakra-ui/react";
// replaced CreatableSelect with Chakra UI controlled Input + Tag

// Deliverable types for demonstration—customize as needed
const DELIVERABLE_OPTIONS = [
  { label: "Instagram Story", value: "Instagram Story" },
  { label: "Instagram Post", value: "Instagram Post" },
  { label: "TikTok Video", value: "TikTok Video" },
  { label: "Autograph Signing", value: "Autograph Signing" },
  { label: "Other", value: "Other" }
];
const PAYMENT_STRUCTURES = [
  { label: "Flat Fee", value: "Flat Fee" },
  { label: "Revenue Share", value: "Revenue Share" },
  { label: "Other", value: "Other" }
];
const DEAL_CATEGORIES = [
  { label: "Apparel", value: "Apparel" },
  { label: "Sports Equipment", value: "Sports Equipment" },
  { label: "Events", value: "Events" },
  { label: "Other", value: "Other" }
];
const DEAL_TYPES = [
  { label: "Social Media", value: "Social Media" },
  { label: "In-Person", value: "In-Person" },
  { label: "Appearances", value: "Appearances" },
  { label: "Other", value: "Other" }
];

const STEPS = [{ label: "Deal Details" }];

const initialDeal = {
  payment_structure: "",
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deal_category: "",
  brand_partner: "",
  deliverables: [],
  deliverables_count: {},
  deliverable_other: "",
  deal_type: [],
  is_real_submission: ""
};

export default function FMVStep2({ formData, setFormData, onBack, onNext }) {
  const [localDeal, setLocalDeal] = useState(() => ({
    ...initialDeal,
    ...(formData.step2 || {})
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const toast = useToast();

  useEffect(() => {
    // Save to parent whenever localDeal changes (so user doesn't lose progress)
    setFormData({ ...formData, step2: localDeal });
    // eslint-disable-next-line
  }, [localDeal]);

  const validate = () => {
    let errs = {};
    if (!localDeal.payment_structure) errs.payment_structure = "Required";
    if (localDeal.payment_structure === "Other" && !localDeal.payment_structure_other) errs.payment_structure_other = "Please describe";
    if (!localDeal.deal_length_months) errs.deal_length_months = "Required";
    if (!localDeal.proposed_dollar_amount) errs.proposed_dollar_amount = "Required";
    if (!localDeal.deal_category) errs.deal_category = "Required";
    if (!localDeal.brand_partner) errs.brand_partner = "Required";
    if (!localDeal.deliverables.length) errs.deliverables = "Select at least one deliverable";
    localDeal.deliverables.forEach(del => {
      if (del === "Other" && !localDeal.deliverable_other)
        errs.deliverable_other = "Please describe";
      if (!localDeal.deliverables_count[del])
        errs[`deliverables_count_${del}`] = "Required";
    });
    if (!localDeal.is_real_submission) errs.is_real_submission = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setLocalDeal(deal => ({ ...deal, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  // Multi-select for deliverables
  const handleDeliverablesChange = (selected) => {
    const deliverables = (selected || []).map(d => d.value);
    setLocalDeal(deal => ({
      ...deal,
      deliverables,
      // Clean up deliverables_count and deliverable_other if options removed
      deliverables_count: Object.fromEntries(
        deliverables.map(d => [d, deal.deliverables_count[d] || 1])
      ),
      deliverable_other: deliverables.includes("Other") ? deal.deliverable_other : ""
    }));
  };

  // Multi-select for deal_type
  const handleDealTypeChange = (selected) => {
    setLocalDeal(deal => ({
      ...deal,
      deal_type: (selected || []).map(d => d.value)
    }));
  };

  const handleNext = (e) => {
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
    setFormData({ ...formData, step2: localDeal });
    if (onNext) onNext();
  };

  const progress = 100;
  const progressLabel = "Step 2 of 2: Deal Details";

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
            <Heading fontSize="2xl" color="white">Deal Details</Heading>
            {/* Payment Structure */}
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabel color="gray.200">Payment Structure</FormLabel>
              <ChakraSelect
                placeholder="Select..."
                value={localDeal.payment_structure}
                onChange={e => handleChange("payment_structure", e.target.value)}
                bg="gray.800"
                color="white"
                borderColor="#555"
              >
                <option value="" style={{ color: "#23272f" }}></option>
                {PAYMENT_STRUCTURES.map(opt =>
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
              </ChakraSelect>
              <FormErrorMessage>{errors.payment_structure}</FormErrorMessage>
            </FormControl>
            {localDeal.payment_structure === "Other" && (
              <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
                <FormLabel color="gray.200">Please describe</FormLabel>
                <Input
                  value={localDeal.payment_structure_other}
                  onChange={e => handleChange("payment_structure_other", e.target.value)}
                  placeholder="Describe payment structure"
                  bg="gray.800"
                  color="white"
                />
                <FormErrorMessage>{errors.payment_structure_other}</FormErrorMessage>
              </FormControl>
            )}
            {/* Deal Length */}
            <FormControl isRequired isInvalid={!!errors.deal_length_months}>
              <FormLabel color="gray.200">Deal Length (months)</FormLabel>
              <NumberInput
                value={localDeal.deal_length_months}
                onChange={(_, v) => handleChange("deal_length_months", v)}
                min={1}
                max={48}
              >
                <NumberInputField placeholder="e.g. 6" bg="gray.800" color="white" />
              </NumberInput>
              <FormErrorMessage>{errors.deal_length_months}</FormErrorMessage>
            </FormControl>
            {/* Proposed $ */}
            <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
              <FormLabel color="gray.200">Total Proposed $</FormLabel>
              <NumberInput
                value={localDeal.proposed_dollar_amount}
                onChange={(_, v) => handleChange("proposed_dollar_amount", v)}
                min={0}
                step={100}
                precision={2}
              >
                <NumberInputField placeholder="e.g. 5000" bg="gray.800" color="white" />
              </NumberInput>
              <FormErrorMessage>{errors.proposed_dollar_amount}</FormErrorMessage>
            </FormControl>
            {/* Deal Category */}
            <FormControl isRequired isInvalid={!!errors.deal_category}>
              <FormLabel color="gray.200">Deal Category</FormLabel>
              <ChakraSelect
                placeholder="Select..."
                value={localDeal.deal_category}
                onChange={e => handleChange("deal_category", e.target.value)}
                bg="gray.800"
                color="white"
                borderColor="#555"
              >
                <option value="" style={{ color: "#23272f" }}></option>
                {DEAL_CATEGORIES.map(opt =>
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
              </ChakraSelect>
              <FormErrorMessage>{errors.deal_category}</FormErrorMessage>
            </FormControl>
            {/* Brand Partner */}
            <FormControl isRequired isInvalid={!!errors.brand_partner}>
              <FormLabel color="gray.200">Brand Partner</FormLabel>
              <Input
                value={localDeal.brand_partner}
                onChange={e => handleChange("brand_partner", e.target.value)}
                placeholder="e.g., Nike, Adidas"
                bg="gray.800"
                color="white"
              />
              <FormErrorMessage>{errors.brand_partner}</FormErrorMessage>
            </FormControl>
            {/* Deliverables */}
            <FormControl isRequired isInvalid={!!errors.deliverables}>
              <FormLabel color="gray.200">Deliverables (select all that apply)</FormLabel>
              <CreatableSelect
                isMulti
                options={DELIVERABLE_OPTIONS}
                value={localDeal.deliverables.map(val => ({ label: val, value: val }))}
                onChange={handleDeliverablesChange}
                placeholder="Choose or create…"
                styles={{
                  control: (base) => ({
                    ...base,
                    background: "#222", color: "white", borderColor: "#555"
                  }),
                  multiValueLabel: (base) => ({
                    ...base, color: "white"
                  }),
                  input: (base) => ({ ...base, color: "white" }),
                  menu: (base) => ({ ...base, background: "#23272f", color: "#fff" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#88E788"
                      : state.isFocused
                        ? "#181a20"
                        : "transparent",
                    color: state.isSelected ? "#222" : "#fff",
                  }),
                }}
              />
              <FormErrorMessage>{errors.deliverables}</FormErrorMessage>
            </FormControl>
            {localDeal.deliverables.map(del => (
              <FormControl
                key={del}
                isRequired
                isInvalid={!!errors[`deliverables_count_${del}`]}
              >
                <FormLabel color="gray.300">
                  {del === "Other"
                    ? "Describe Other Deliverable"
                    : `# of ${del}`}
                </FormLabel>
                {del === "Other" ? (
                  <Input
                    value={localDeal.deliverable_other}
                    onChange={e => handleChange("deliverable_other", e.target.value)}
                    placeholder="Describe deliverable"
                    bg="gray.800"
                    color="white"
                  />
                ) : (
                  <NumberInput
                    value={localDeal.deliverables_count[del] || 1}
                    min={1}
                    max={10}
                    onChange={(_, v) =>
                      setLocalDeal(deal => ({
                        ...deal,
                        deliverables_count: { ...deal.deliverables_count, [del]: v }
                      }))
                    }
                  >
                    <NumberInputField bg="gray.800" color="white" />
                  </NumberInput>
                )}
                <FormErrorMessage>{errors[`deliverables_count_${del}`]}</FormErrorMessage>
              </FormControl>
            ))}
            {/* Deal Type */}
            <FormControl>
              <FormLabel color="gray.200">Deal Types (optional, multi-select)</FormLabel>
              <CreatableSelect
                isMulti
                options={DEAL_TYPES}
                value={localDeal.deal_type.map(val => ({ label: val, value: val }))}
                onChange={handleDealTypeChange}
                placeholder="Choose or create…"
                styles={{
                  control: (base) => ({
                    ...base,
                    background: "#222", color: "white", borderColor: "#555"
                  }),
                  multiValueLabel: (base) => ({
                    ...base, color: "white"
                  }),
                  input: (base) => ({ ...base, color: "white" }),
                  menu: (base) => ({ ...base, background: "#23272f", color: "#fff" }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#88E788"
                      : state.isFocused
                        ? "#181a20"
                        : "transparent",
                    color: state.isSelected ? "#222" : "#fff",
                  }),
                }}
              />
            </FormControl>
            {/* Is Real Submission */}
            <FormControl isRequired isInvalid={!!errors.is_real_submission}>
              <FormLabel color="gray.200">Is this a real submission?</FormLabel>
              <Flex gap={5}>
                <Button
                  variant={localDeal.is_real_submission === "yes" ? "solid" : "outline"}
                  colorScheme="green"
                  onClick={() => handleChange("is_real_submission", "yes")}
                >
                  Yes
                </Button>
                <Button
                  variant={localDeal.is_real_submission === "no" ? "solid" : "outline"}
                  colorScheme="gray"
                  onClick={() => handleChange("is_real_submission", "no")}
                >
                  No (Test/Demo)
                </Button>
              </Flex>
              <FormErrorMessage>{errors.is_real_submission}</FormErrorMessage>
            </FormControl>
          </Stack>
          <Flex mt={8} justify="space-between">
            <Button
              onClick={e => {
                e.preventDefault();
                if (onBack) onBack();
              }}
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
              Review
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
