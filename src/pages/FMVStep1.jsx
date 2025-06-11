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

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "#ffffff",
    borderColor: state.isFocused ? "#d0bdb5" : "#d6dce4",
    color: "#282f3d",
    boxShadow: state.isFocused ? "0 0 0 1px #d0bdb5" : "none",
    "&:hover": {
      borderColor: "#d0bdb5",
    },
  }),
  singleValue: (base) => ({ ...base, color: "#282f3d" }),
  input: (base) => ({ ...base, color: "#282f3d" }),
  menu: (base) => ({ ...base, background: "#ffffff", zIndex: 9999, border: "1px solid #d6dce4" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#d0bdb5" : state.isFocused ? "#f4f4f4" : "transparent",
    color: state.isSelected ? "#ffffff" : "#282f3d",
    "&:active": {
      backgroundColor: "#c9b2a9",
    },
  }),
  placeholder: (base) => ({ ...base, color: "#4e6a7b" }),
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

  const schoolOptions = React.useMemo(() => {
    if (!divisionValue) return [];
    return NCAA_SCHOOL_OPTIONS.filter(o => o.division === divisionValue);
  }, [divisionValue]);

  useEffect(() => {
    if (divisionValue && schoolValue && !schoolOptions.find(o => o.value === schoolValue)) {
      setValue('school', '');
    }
  }, [divisionValue, schoolValue, schoolOptions, setValue]);

  useEffect(() => {
    setValue('sport', '');
  }, [genderValue, setValue]);

  const progress = ((step + 1) / STEPS_CONFIG.length) * 50;
  const progressLabel = `Step ${step + 1} of 2: ${STEPS_CONFIG[step].label}`;

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
      navigate(-1);
    }
  };
  
  const handleFormReset = () => {
    resetFormData();
    reset();
    setStep(0);
    toast({
      title: "Form reset!",
      status: "info",
      duration: 1500,
      isClosable: true
    });
  };
  
  const inputStyles = {
    bg: "#ffffff",
    borderColor: "#d6dce4",
    color: "#282f3d",
    _hover: { borderColor: "#d0bdb5" },
    _focus: { borderColor: "#d0bdb5", boxShadow: "0 0 0 1px #d0bdb5" },
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d" py={10}>
      <Box w={["95vw", "600px"]} bg="#ffffff" boxShadow="xl" borderRadius="xl" p={[4, 8]} mx="auto" border="1px solid #d6dce4">
        <Box mb={6}>
          <Text color="#4e6a7b" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">{progressLabel}</Text>
          <Progress value={progress} size="md" colorScheme="pink" sx={{ "& > div": { backgroundColor: "#d0bdb5" } }} borderRadius="full" mb={2} />
        </Box>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={6}>
            {step === 0 && (
              <>
                <Heading fontSize="2xl" color="#282f3d">Profile</Heading>
                <FormControl isRequired isInvalid={!!errors.division}>
                  <FormLabel color="#4e6a7b">Division</FormLabel>
                  <Controller name="division" control={control} render={({ field }) => (
                    <Select options={DIVISIONS.map(d => ({ label: d, value: d }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select division..." styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.school}>
                  <FormLabel color="#4e6a7b">School</FormLabel>
                  <Controller name="school" control={control} render={({ field }) => (
                     <Select options={schoolOptions} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Type to search your school..." isDisabled={!divisionValue} isClearable isSearchable styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.school?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel color="#4e6a7b">Full Name</FormLabel>
                  <Input {...register("name")} placeholder="Your Name" {...inputStyles} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.email}>
                  <FormLabel color="#4e6a7b">Email</FormLabel>
                  <Input type="email" {...register("email")} placeholder="you@email.com" {...inputStyles} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
            
            {step === 1 && (
              <>
                <Heading fontSize="2xl" color="#282f3d">Academics & Athletics</Heading>
                <FormControl isRequired isInvalid={!!errors.gender}>
                  <FormLabel color="#4e6a7b">Gender</FormLabel>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select options={GENDERS.map(g => ({ label: g, value: g }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select gender" styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.sport}>
                  <FormLabel color="#4e6a7b">Sport</FormLabel>
                   <Controller name="sport" control={control} render={({ field }) => (
                    <Select options={(SPORTS[genderValue] || []).map(s => ({ label: s, value: s }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select sport" isDisabled={!genderValue} styles={selectStyles} />
                  )} />
                  <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.graduation_year}>
                  <FormLabel color="#4e6a7b">Graduation Year</FormLabel>
                  <Controller name="graduation_year" control={control} render={({ field }) => (
                    <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={2024} max={2035}>
                      <NumberInputField placeholder="2026" {...inputStyles} />
                    </NumberInput>
                  )} />
                  <FormErrorMessage>{errors.graduation_year?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.gpa}>
                  <FormLabel color="#4e6a7b">GPA (optional)</FormLabel>
                  <Input {...register("gpa")} placeholder="e.g., 3.78" inputMode="decimal" {...inputStyles} />
                  <FormErrorMessage>{errors.gpa?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.age}>
                  <FormLabel color="#4e6a7b">Age (optional)</FormLabel>
                  <Controller name="age" control={control} render={({ field }) => (
                     <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={15} max={99}>
                      <NumberInputField placeholder="e.g., 20" {...inputStyles} />
                    </NumberInput>
                  )} />
                   <FormErrorMessage>{errors.age?.message}</FormErrorMessage>
                </FormControl>

                 <FormControl isInvalid={!!errors.prior_nil_deals}>
                  <FormLabel color="#4e6a7b">Prior NIL Deals (optional)</FormLabel>
                   <Controller name="prior_nil_deals" control={control} render={({ field }) => (
                     <NumberInput {...field} value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={0}>
                      <NumberInputField placeholder="e.g., 2" {...inputStyles} />
                    </NumberInput>
                  )} />
                   <FormErrorMessage>{errors.prior_nil_deals?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
          </Stack>
          
          <Flex mt={8} justify="space-between">
            <Button onClick={handleBack} variant="outline" borderColor="#d6dce4" color="#4e6a7b" _hover={{ bg: "#f4f4f4" }}>Back</Button>
            <Button onClick={handleNext} bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }} px={8} fontWeight="bold">
              {step === STEPS_CONFIG.length - 1 ? "Continue" : "Next"}
            </Button>
          </Flex>
        </form>

        <Flex mt={3} justify="space-between" align="center">
          <Button size="sm" variant="ghost" color="#4e6a7b" onClick={handleFormReset}>Reset Form</Button>
          <Button size="sm" variant="ghost" color="#4e6a7b" onClick={() => {
             toast({
                title: "Resume link copied!",
                status: "success",
                duration: 1500,
                isClosable: true
              });
              navigator.clipboard.writeText(window.location.href);
           }}>Save Progress</Button>
        </Flex>
      </Box>
    </Flex>
  );
}