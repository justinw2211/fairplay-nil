import React, { useState, useEffect, useRef } from "react";
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
const STEPS = [
  { label: "Profile" },
  { label: "Academics & Athletics" }
];

const initialFormData = {
  division: "",
  school: "",
  name: "",
  email: "",
  gender: "",
  sport: "",
  graduation_year: "",
  age: "",
  gpa: "",
  prior_nil_deals: ""
};

function isGPAValid(val) {
  if (val === "") return true;
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0 && num <= 4 && /^\d(\.\d{1,2})?$|^4(\.00?)?$/.test(val);
}

function getStepLabel(step) {
  return STEPS[step] ? STEPS[step].label : "";
}

export default function FMVStep1({ formData, setFormData, onNext }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(() => ({ ...initialFormData, ...formData }));
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolInput, setSchoolInput] = useState("");
  const toast = useToast();
  const gpaInputRef = useRef(null);

  // Autosave
  useEffect(() => {
    localStorage.setItem("fpn_profile", JSON.stringify(localForm));
  }, [localForm]);

  useEffect(() => {
    // Set options based on division
    if (localForm.division) {
      const options = NCAA_SCHOOL_OPTIONS.filter(o => o.division === localForm.division);
      setSchoolOptions(options);
      setLocalForm(f => ({ ...f, school: "" }));
    } else {
      setSchoolOptions([]);
      setLocalForm(f => ({ ...f, school: "" }));
    }
    setSchoolInput("");
    // eslint-disable-next-line
  }, [localForm.division]);

  useEffect(() => {
    if (errors.gpa && gpaInputRef.current) gpaInputRef.current.focus();
  }, [errors.gpa]);

  // GPA logic
  const handleGPAChange = (value) => {
    // Accept only valid numbers and one dot
    if (value === "" || /^\d{0,1}(\.\d{0,2})?$/.test(value)) {
      setLocalForm(f => ({ ...f, gpa: value }));
      setErrors(e => ({ ...e, gpa: undefined }));
    }
  };

  const handleGPABlur = () => {
    let val = localForm.gpa;
    if (val === "") return;
    // If "372", convert to "3.72"
    if (/^\d{3}$/.test(val)) {
      val = `${val[0]}.${val.slice(1)}`;
    }
    // Remove leading zeros
    val = val.replace(/^0+(\d)/, "$1");
    let num = parseFloat(val);
    if (isNaN(num) || num < 0 || num > 4) {
      setLocalForm(f => ({ ...f, gpa: "" }));
      setErrors(e => ({ ...e, gpa: "GPA must be 0.00–4.00" }));
    } else {
      setLocalForm(f => ({ ...f, gpa: num.toFixed(2) }));
      setErrors(e => ({ ...e, gpa: undefined }));
    }
  };

  const validateStep = () => {
    let stepErrors = {};
    if (step === 0) {
      if (!localForm.division) stepErrors.division = "Division is required.";
      if (!localForm.school) stepErrors.school = "School is required.";
      if (!localForm.name.trim()) stepErrors.name = "Full name is required.";
      if (!localForm.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(localForm.email))
        stepErrors.email = "Valid email is required.";
    }
    if (step === 1) {
      if (!localForm.gender) stepErrors.gender = "Gender is required.";
      if (!localForm.sport) stepErrors.sport = "Sport is required.";
      if (!localForm.graduation_year) stepErrors.graduation_year = "Graduation year is required.";
      if (localForm.gpa !== "" && !isGPAValid(localForm.gpa))
        stepErrors.gpa = "GPA must be a number between 0.00 and 4.00 (two decimals).";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const progressLabel = `Step ${step + 1} of ${STEPS.length}: ${getStepLabel(step)}`;

  // Navigation handlers
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
    if (step === STEPS.length - 1) {
      setFormData(localForm); // Save to parent/global
      if (onNext) onNext();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      window.history.length > 1 ? window.history.back() : null;
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  const updateField = (field, value) => {
    setLocalForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  // School select handler
  const handleSchoolChange = (selected) => {
    updateField("school", selected ? selected.label : "");
    setSchoolInput(selected ? selected.label : "");
  };

  // Manual entry handler
  const handleSchoolInputChange = (inputVal) => {
    setSchoolInput(inputVal);
  };

  // On blur, enforce only picking from valid schools
  const handleSchoolBlur = () => {
    const found = schoolOptions.find(opt => opt.label.toLowerCase() === (schoolInput || "").trim().toLowerCase());
    if (found) {
      updateField("school", found.label);
    } else if (schoolInput.trim()) {
      updateField("school", "");
      setErrors(e => ({ ...e, school: "Please select a valid school from the list." }));
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
            {step === 0 && (
              <>
                <Heading fontSize="2xl" color="white">Profile</Heading>
                <FormControl isRequired isInvalid={!!errors.division}>
                  <FormLabel color="gray.200">Division</FormLabel>
                  <Select
                    options={DIVISIONS.map(d => ({ label: d, value: d }))}
                    value={localForm.division ? { label: localForm.division, value: localForm.division } : null}
                    onChange={selected => updateField("division", selected ? selected.value : "")}
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
                <FormControl isRequired isInvalid={!!errors.school}>
                  <FormLabel color="gray.200">School</FormLabel>
                  <Select
                    inputValue={schoolInput}
                    onInputChange={handleSchoolInputChange}
                    options={schoolOptions}
                    value={localForm.school ? { label: localForm.school, value: localForm.school } : null}
                    onChange={handleSchoolChange}
                    onBlur={handleSchoolBlur}
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
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel color="gray.200">Full Name</FormLabel>
                  <Input
                    value={localForm.name}
                    onChange={e => updateField("name", e.target.value)}
                    placeholder="Your Name"
                    bg="gray.800"
                    style={{ color: "white" }}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!errors.email}>
                  <FormLabel color="gray.200">Email</FormLabel>
                  <Input
                    type="email"
                    value={localForm.email}
                    onChange={e => updateField("email", e.target.value)}
                    placeholder="you@email.com"
                    bg="gray.800"
                    style={{ color: "white" }}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
              </>
            )}
            {step === 1 && (
              <>
                <Heading fontSize="2xl" color="white">Academics & Athletics</Heading>
                <FormControl isRequired isInvalid={!!errors.gender}>
                  <FormLabel color="gray.200">Gender</FormLabel>
                  <Select
                    options={GENDERS.map(g => ({ label: g, value: g }))}
                    value={localForm.gender ? { label: localForm.gender, value: localForm.gender } : null}
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
                <FormControl isRequired isInvalid={!!errors.sport}>
                  <FormLabel color="gray.200">Sport</FormLabel>
                  <Select
                    options={localForm.gender ? (SPORTS[localForm.gender] || []).map(s => ({ label: s, value: s })) : []}
                    value={localForm.sport ? { label: localForm.sport, value: localForm.sport } : null}
                    onChange={selected => updateField("sport", selected ? selected.value : "")}
                    placeholder="Select sport"
                    isDisabled={!localForm.gender}
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
                <FormControl isRequired isInvalid={!!errors.graduation_year}>
                  <FormLabel color="gray.200">Graduation Year</FormLabel>
                  <NumberInput
                    value={localForm.graduation_year}
                    onChange={(_, v) => updateField("graduation_year", v)}
                    min={2024} max={2030}
                  >
                    <NumberInputField placeholder="2026" bg="gray.800" style={{ color: "white" }} />
                  </NumberInput>
                  <FormErrorMessage>{errors.graduation_year}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.gpa}>
                  <FormLabel color="gray.200">GPA (optional)</FormLabel>
                  <Input
                    ref={gpaInputRef}
                    value={localForm.gpa}
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
                <FormControl>
                  <FormLabel color="gray.200">Age (optional)</FormLabel>
                  <NumberInput
                    value={localForm.age}
                    onChange={(_, v) => updateField("age", v)}
                    min={15} max={30}
                  >
                    <NumberInputField placeholder="e.g., 20" bg="gray.800" style={{ color: "white" }} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.200">Prior NIL Deals (optional)</FormLabel>
                  <NumberInput
                    value={localForm.prior_nil_deals}
                    onChange={(_, v) => updateField("prior_nil_deals", v)}
                    min={0}
                  >
                    <NumberInputField placeholder="e.g., 2" bg="gray.800" style={{ color: "white" }} />
                  </NumberInput>
                </FormControl>
              </>
            )}
          </Stack>
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0 && window.history.length <= 1}
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
        <Flex mt={3} justify="space-between" align="center">
          <Button
            size="sm"
            colorScheme="gray"
            variant="ghost"
            style={{ color: "#88E788" }}
            onClick={() => {
              localStorage.setItem("fpn_profile", JSON.stringify(initialFormData));
              setLocalForm(initialFormData);
              setStep(0);
              setTouched({});
              setErrors({});
              setSchoolInput("");
              toast({
                title: "Form reset!",
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
