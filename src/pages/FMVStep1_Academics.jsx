import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step2Schema } from '../validation/schemas';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, Text, FormErrorMessage, useToast
} from "@chakra-ui/react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const GENDERS = ["Male", "Female", "Nonbinary", "Prefer not to say", "Other"];

const MEN_SPORTS = [
  "Baseball", "Basketball", "Cross Country", "Fencing", "Football", "Golf",
  "Gymnastics", "Ice Hockey", "Lacrosse", "Rifle", "Rowing", "Skiing", "Soccer",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Volleyball", "Water Polo", "Wrestling"
];

const WOMEN_SPORTS = [
  "Acrobatics & Tumbling", "Basketball", "Beach Volleyball", "Bowling", "Cross Country",
  "Equestrian", "Fencing", "Field Hockey", "Golf", "Gymnastics", "Ice Hockey",
  "Lacrosse", "Rifle", "Rowing", "Rugby", "Skiing", "Soccer", "Softball",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Triathlon", "Volleyball", "Water Polo", "Wrestling"
];

const COMBINED_SPORTS = [
    ...MEN_SPORTS.map(s => ({ label: `Men's ${s}`, value: `Men's ${s}` })),
    ...WOMEN_SPORTS.map(s => ({ label: `Women's ${s}`, value: `Women's ${s}` }))
].sort((a, b) => a.label.localeCompare(b.label));

const ACHIEVEMENT_OPTIONS = [
  { label: "All-American", value: "All-American" },
  { label: "All-Conference", value: "All-Conference" },
  { label: "National Champion", value: "National Champion" },
  { label: "Conference Champion", value: "Conference Champion" },
  { label: "Team Captain", value: "Team Captain" },
  { label: "Other", value: "Other" },
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
  multiValue: (base) => ({ ...base, backgroundColor: "#d6dce4" }),
  multiValueLabel: (base) => ({ ...base, color: "#282f3d" }),
  multiValueRemove: (base) => ({ ...base, color: "#282f3d", "&:hover": { backgroundColor: "#d0bdb5", color: "white" } }),
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

export default function FMVStep1_Academics({ onBack, onNext }) {
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset } = useForm({
    resolver: yupResolver(step2Schema),
    defaultValues: formData,
  });

  const genderValue = watch('gender');

  const sportOptions = useMemo(() => {
    if (genderValue === 'Male') return MEN_SPORTS.map(s => ({ label: s, value: s }));
    if (genderValue === 'Female') return WOMEN_SPORTS.map(s => ({ label: s, value: s }));
    if (['Nonbinary', 'Prefer not to say', 'Other'].includes(genderValue)) {
      return COMBINED_SPORTS;
    }
    return [];
  }, [genderValue]);

  useEffect(() => {
    setValue('sport', []);
  }, [genderValue, setValue]);

  const progress = (2 / 3) * 100;
  const progressLabel = "Step 2 of 3: Academics & Athletics";

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(data => {
        updateFormData(data);
        if (onNext) onNext();
      })();
    }
  };

  const handleFormReset = () => {
    resetFormData();
    reset({
      gender: "",
      sport: [],
      graduation_year: "",
      age: "",
      gpa: "",
      achievements: [],
      prior_nil_deals: "",
    });
    toast({
      title: "Form reset!",
      description: "You can start over from Step 1.",
      status: "info",
      duration: 2000,
      isClosable: true
    });
  };

  const handleGpaBlur = (e) => {
    let value = e.target.value;
    if (value === "" || value === null) return;
  
    // Allow only numbers and a single dot
    value = value.replace(/[^0-9.]/g, '');
    
    let num = parseFloat(value);
  
    if (isNaN(num)) {
      setValue("gpa", "");
      return;
    }
  
    // Clamp the value between 0 and 4
    if (num < 0) num = 0;
    if (num > 4) num = 4;
  
    // Format to 2 decimal places
    const formattedGpa = num.toFixed(2);
    setValue("gpa", formattedGpa, { shouldValidate: true });
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
            <Heading fontSize="2xl" color="#282f3d">Academics & Athletics</Heading>
            <FormControl isRequired isInvalid={!!errors.gender}>
              <FormLabel color="#4e6a7b">Gender</FormLabel>
              <Controller name="gender" control={control} render={({ field }) => (
                <Select options={GENDERS.map(g => ({ label: g, value: g }))} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} placeholder="Select gender" styles={selectStyles} />
              )} />
              <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.sport}>
              <FormLabel color="#4e6a7b">Sport(s)</FormLabel>
              <Controller name="sport" control={control} render={({ field }) => (
                <Select
                  isMulti
                  options={sportOptions}
                  value={sportOptions.filter(opt => field.value?.includes(opt.value))}
                  onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                  placeholder="Select all that apply..."
                  isDisabled={!genderValue}
                  styles={selectStyles}
                />
              )} />
              <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.achievements}>
              <FormLabel color="#4e6a7b">Athletic Achievements (optional)</FormLabel>
              <Controller
                name="achievements"
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    isMulti
                    options={ACHIEVEMENT_OPTIONS}
                    value={field.value ? field.value.map(v => ({label: v, value: v})) : []}
                    onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                    placeholder="Choose or create..."
                    styles={selectStyles}
                  />
                )}
              />
              <FormErrorMessage>{errors.achievements?.message}</FormErrorMessage>
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
              <Input
                {...register("gpa")}
                placeholder="e.g., 3.78"
                inputMode="decimal"
                onBlur={handleGpaBlur}
                {...inputStyles}
              />
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
                  <NumberInput {...field} value={field.value ?? ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={0}>
                  <NumberInputField placeholder="e.g., 0" {...inputStyles} />
                </NumberInput>
              )} />
                <FormErrorMessage>{errors.prior_nil_deals?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
          
          <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline" borderColor="#d6dce4" color="#4e6a7b" _hover={{ bg: "#f4f4f4" }}>Back</Button>
            <Button onClick={handleNext} bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }} px={8} fontWeight="bold">
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