import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step1Schema } from '../validation/schemas';
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, useToast, Text, FormErrorMessage
} from "@chakra-ui/react";
import Select from "react-select";
import { NCAA_SCHOOL_OPTIONS } from "../data/ncaaSchools.js";

const DIVISIONS = ["I", "II", "III"];
const GENDERS = ["Male", "Female", "Nonbinary", "Prefer not to say", "Other"];
const SPORTS = {
  Male: ["Basketball", "Football", "Baseball", "Soccer", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"],
  Female: ["Basketball", "Soccer", "Volleyball", "Softball", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"],
  Nonbinary: ["Basketball", "Soccer", "Track & Field", "Cross Country", "Other"],
  "Prefer not to say": ["Basketball", "Soccer", "Track & Field", "Cross Country", "Other"],
  Other: ["Basketball", "Soccer", "Track & Field", "Cross Country", "Other"],
};

const STEPS_CONFIG = [
  { label: "Profile", fields: ['division', 'school', 'name', 'email'] },
  { label: "Academics & Athletics", fields: ['gender', 'sport', 'graduation_year', 'gpa', 'age', 'prior_nil_deals'] }
];

// Reusable style object for react-select components
const selectStyles = {
  control: (base) => ({
    ...base,
    background: "#2d3748", // gray.700
    borderColor: "#4a5568", // gray.600
    color: "white",
    "&:hover": {
      borderColor: "#63b3ed", // blue.300
    },
  }),
  singleValue: (base) => ({ ...base, color: "white" }),
  input: (base) => ({ ...base, color: "white" }),
  menu: (base) => ({ ...base, background: "#1a202c", zIndex: 9999 }), // gray.900
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#38a169" : state.isFocused ? "#2d3748" : "transparent", // green.500 : gray.700
    "&:active": {
      backgroundColor: "#276749", // green.700
    },
  }),
  placeholder: (base) => ({ ...base, color: "#a0aec0" }), // gray.400
};

export default function FMVStep1({ onNext }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset } = useForm({
    resolver: yupResolver(step1Schema),
    defaultValues: formData,
  });

  const genderValue = watch('gender');
  const divisionValue = watch('division');
  const schoolValue = watch('school');

  // Filter school options based on division
  const schoolOptions = React.useMemo(() => {
    if (!divisionValue) return [];
    return NCAA_SCHOOL_OPTIONS.filter(o => o.division === divisionValue);
  }, [divisionValue]);

  // Reset school when division changes
  useEffect(() => {
    if (divisionValue && schoolValue && !schoolOptions.find(o => o.value === schoolValue)) {
      setValue('school', '');
    }
  }, [divisionValue, schoolValue, schoolOptions, setValue]);

  // Reset sport when gender changes
  useEffect(() => {
    setValue('sport', '');
  }, [genderValue, setValue]);

  const progress = ((step + 1) / STEPS_CONFIG.length) * 100;
  const progressLabel = `Step ${step + 1} of ${STEPS_CONFIG.length}: ${STEPS_CONFIG[step].label}`;

  const handleNext = async () => {
    const fieldsToValidate = STEPS_CONFIG[step].fields;
    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });

    if (!isValid) {
      toast({
        title: "Please complete all required fields correctly.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    if (step < STEPS_CONFIG.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit(data => {
        updateFormData(data);
        if (onNext) onNext();
      })();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    } else {
      navigate(-1); // Go back to the previous page in history
    }
  };
  
  const handleFormReset = () => {
    resetFormData();
    reset(); // Reset react-hook-form's internal state
    setStep(0);
    toast({
      title: "Form reset!",
      status: "info",
      duration: 1500,
      isClosable: true
    });
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}>
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Box mb={6}>
          <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">{progressLabel}</Text>
          <Progress value={progress} size="md" colorScheme="green" borderRadius="full" hasStripe isAnimated mb={2} />
        </Box>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={6}>
            {step === 0 && (
              <>
                <Heading fontSize="2xl" color="white">Profile</Heading>
                <FormControl isRequired isInvalid={!!errors.division}>
                  <FormLabel color="gray.200">Division</FormLabel>
                  <Controller name="division" control={control} render={({ field }) => (
                    <Select options={DIVISIONS.map(d => ({ label: d, value: d }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select division..." styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.school}>
                  <FormLabel color="gray.200">School</FormLabel>
                  <Controller name="school" control={control} render={({ field }) => (
                     <Select options={schoolOptions} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Type to search your school..." isDisabled={!divisionValue} isClearable isSearchable styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.school?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel color="gray.200">Full Name</FormLabel>
                  <Input {...register("name")} placeholder="Your Name" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.email}>
                  <FormLabel color="gray.200">Email</FormLabel>
                  <Input type="email" {...register("email")} placeholder="you@email.com" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
            
            {step === 1 && (
              <>
                <Heading fontSize="2xl" color="white">Academics & Athletics</Heading>
                <FormControl isRequired isInvalid={!!errors.gender}>
                  <FormLabel color="gray.200">Gender</FormLabel>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select options={GENDERS.map(g => ({ label: g, value: g }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select gender" styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.sport}>
                  <FormLabel color="gray.200">Sport</FormLabel>
                   <Controller name="sport" control={control} render={({ field }) => (
                    <Select options={(SPORTS[genderValue] || []).map(s => ({ label: s, value: s }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select sport" isDisabled={!genderValue} styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.graduation_year}>
                  <FormLabel color="gray.200">Graduation Year</FormLabel>
                  <Controller name="graduation_year" control={control} render={({ field }) => (
                    <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={2024} max={2035}>
                      <NumberInputField placeholder="2026" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                    </NumberInput>
                  )} />
                  <FormErrorMessage>{errors.graduation_year?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.gpa}>
                  <FormLabel color="gray.200">GPA (optional)</FormLabel>
                  <Input {...register("gpa")} placeholder="e.g., 3.78" bg="gray.800" inputMode="decimal" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                  <FormErrorMessage>{errors.gpa?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.age}>
                  <FormLabel color="gray.200">Age (optional)</FormLabel>
                  <Controller name="age" control={control} render={({ field }) => (
                     <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={15} max={99}>
                      <NumberInputField placeholder="e.g., 20" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                    </NumberInput>
                  )} />
                   <FormErrorMessage>{errors.age?.message}</FormErrorMessage>
                </FormControl>

                 <FormControl isInvalid={!!errors.prior_nil_deals}>
                  <FormLabel color="gray.200">Prior NIL Deals (optional)</FormLabel>
                   <Controller name="prior_nil_deals" control={control} render={({ field }) => (
                     <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={0}>
                      <NumberInputField placeholder="e.g., 2" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }} />
                    </NumberInput>
                  )} />
                   <FormErrorMessage>{errors.prior_nil_deals?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
          </Stack>
          
          <Flex mt={8} justify="space-between">
            <Button onClick={handleBack} colorScheme="green" variant="outline" _hover={{ bg: "#23272f", color: "#88E788", borderColor: "#88E788" }}>Back</Button>
            <Button onClick={handleNext} colorScheme="green" px={8} fontWeight="bold">
              {step === STEPS_CONFIG.length - 1 ? "Continue" : "Next"}
            </Button>
          </Flex>
        </form>

        <Flex mt={3} justify="space-between" align="center">
          <Button size="sm" colorScheme="gray" variant="ghost" style={{ color: "#88E788" }} onClick={handleFormReset}>Reset Form</Button>
          <Button size="sm" colorScheme="green" variant="ghost" style={{ color: "#88E788" }} onClick={() => {
             toast({
                title: "Resume link copied!",
                status: "success",
                duration: 1500,
                isClosable: true
              });
              navigator.clipboard.writeText(window.location.href);
           }}>Save Progress & Get Link</Button>
        </Flex>
      </Box>
    </Flex>
  );
}
