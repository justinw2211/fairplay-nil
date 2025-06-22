// src/pages/FMVStep1.jsx
import React, { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step1Schema } from '../validation/schemas';
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, useToast, Text, FormErrorMessage, FormHelperText
} from "@chakra-ui/react";
import Select from "react-select";
import { NCAA_SCHOOL_OPTIONS } from "../data/ncaaSchools.js";

const DIVISIONS = ["I", "II", "III"];

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
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset } = useForm({
    resolver: yupResolver(step1Schema),
    defaultValues: formData,
  });

  // THE FIX: This useEffect ensures the form stays in sync with the context data
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const divisionValue = watch('division');
  const schoolValue = watch('school');

  const schoolOptions = useMemo(() => {
    if (!divisionValue) return [];
    return NCAA_SCHOOL_OPTIONS.filter(o => o.division === divisionValue);
  }, [divisionValue]);

  useEffect(() => {
    if (divisionValue && schoolValue && !schoolOptions.find(o => o.value === schoolValue)) {
      setValue('school', '');
    }
  }, [divisionValue, schoolValue, schoolOptions, setValue]);

  const progress = (1 / 3) * 100;
  const progressLabel = "Step 1 of 3: Profile";

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(data => {
        updateFormData(data);
        if (onNext) onNext();
      })();
    }
  };

  const handleBack = () => {
      navigate(-1);
  };
  
  const handleFormReset = () => {
    resetFormData();
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
          <Progress value={progress} size="md" />
        </Box>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={6}>
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
              <FormHelperText>Using your official university email is recommended.</FormHelperText>
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
          
          <Flex mt={8} justify="space-between">
            <Button onClick={handleBack} variant="outline">Back</Button>
            <Button onClick={handleNext} px={8} fontWeight="bold">
              Next
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