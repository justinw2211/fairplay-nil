import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import * as yup from 'yup';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl,
  FormLabel, Input, NumberInput, NumberInputField, useToast,
  Text, FormErrorMessage,
} from '@chakra-ui/react';

import { useFMV } from '../../context/FMVContext';
import { fullFmvSchema } from '../../validation/schemas';
import { NCAA_SCHOOL_OPTIONS } from '../../data/ncaaSchools.js';

const DIVISIONS = ['I', 'II', 'III'];
const GENDERS = ['Male', 'Female', 'Nonbinary', 'Prefer not to say', 'Other'];
const SPORTS = {
  Male: [ 'Basketball', 'Football', 'Baseball', 'Soccer', 'Track & Field', 'Cross Country', 'Lacrosse', 'Golf', 'Swimming', 'Tennis', 'Other' ],
  Female: [ 'Basketball', 'Soccer', 'Volleyball', 'Softball', 'Track & Field', 'Cross Country', 'Lacrosse', 'Golf', 'Swimming', 'Tennis', 'Other' ],
  Nonbinary: ['Basketball', 'Soccer', 'Track & Field', 'Cross Country', 'Other'],
  'Prefer not to say': ['Basketball', 'Soccer', 'Track & Field', 'Cross Country', 'Other' ],
  Other: ['Basketball', 'Soccer', 'Track & Field', 'Cross Country', 'Other'],
};

const STEPS_CONFIG = [
  { label: 'Profile', fields: ['division', 'school', 'name', 'email'] },
  { label: 'Academics & Athletics', fields: [ 'gender', 'sport', 'graduation_year', 'gpa', 'age', 'prior_nil_deals', ], },
];

const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    background: 'white',
    minHeight: '40px',
    borderColor: hasError ? '#E53E3E' : state.isFocused ? '#d0bdb5' : '#d6dce4',
    boxShadow: hasError ? '0 0 0 1px #E53E3E' : state.isFocused ? '0 0 0 1px #d0bdb5' : 'none',
    '&:hover': { borderColor: hasError ? '#E53E3E' : '#d0bdb5' },
  }),
});

export default function FMVStep1({ onNext }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const { formData, updateFormData, resetFormData, initialFormData } = useFMV();

  const currentSchema = yup.object().shape(
    STEPS_CONFIG[step].fields.reduce((acc, field) => {
      acc[field] = fullFmvSchema.fields[field];
      return acc;
    }, {})
  );

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset, } = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: formData,
    mode: 'onChange',
  });

  const genderValue = watch('gender');
  const divisionValue = watch('division');

  const schoolOptions = React.useMemo(() => {
    if (!divisionValue) return [];
    return NCAA_SCHOOL_OPTIONS.filter((o) => o.division === divisionValue);
  }, [divisionValue]);

  useEffect(() => {
    if(watch('gender') !== genderValue) {
        setValue('sport', '');
    }
  }, [genderValue, setValue, watch]);

  const progress = ((step + 1) / STEPS_CONFIG.length) * 100;
  const progressLabel = `Step ${step + 1} of ${STEPS_CONFIG.length}: ${STEPS_CONFIG[step].label}`;

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit((data) => {
        updateFormData(data);
        if (step < STEPS_CONFIG.length - 1) {
          setStep((s) => s + 1);
        } else {
          onNext();
        }
      })();
    } else {
      toast({
        title: 'Please review the fields.',
        description: 'One or more fields have errors.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBack = () => step > 0 ? setStep((s) => s - 1) : navigate(-1);
  
  const handleFormReset = () => { 
    resetFormData(); 
    reset(initialFormData); 
    setStep(0);
    toast({
        title: "Form reset!",
        status: "info",
        duration: 1500,
        isClosable: true
    });
  };

  return (
    <Flex minH="calc(100vh - 88px)" align="center" justify="center" p={4}>
      <Stack spacing={6} w="full" maxW="2xl" bg="brand.secondary" p={{ base: 6, md: 8 }} borderRadius="xl" shadow="lg">
        <Box mb={2}>
          <Text color="brand.textSecondary" fontWeight="600" fontSize="sm" mb={2}>{progressLabel}</Text>
          <Progress value={progress} size="sm" colorScheme="gray" borderRadius="full" />
        </Box>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={5}>
            {step === 0 && (
              <>
                <Heading size="lg">Athlete Profile</Heading>
                <FormControl isInvalid={!!errors.division} isRequired>
                  <FormLabel>Division</FormLabel>
                  <Controller name="division" control={control} render={({ field }) => <Select {...field} options={DIVISIONS.map(d => ({ label: d, value: d }))} styles={selectStyles(!!errors.division)} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} />} />
                  <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.school} isRequired>
                  <FormLabel>School</FormLabel>
                  <Controller name="school" control={control} render={({ field }) => <Select {...field} options={schoolOptions} styles={selectStyles(!!errors.school)} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} isDisabled={!divisionValue} />} />
                  <FormErrorMessage>{errors.school?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input {...register('name')} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.email} isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" {...register('email')} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
            {step === 1 && (
              <>
                <Heading size="lg">Academics & Athletics</Heading>
                <FormControl isInvalid={!!errors.gender} isRequired>
                  <FormLabel>Gender</FormLabel>
                  <Controller name="gender" control={control} render={({ field }) => <Select {...field} options={GENDERS.map(g => ({ label: g, value: g }))} styles={selectStyles(!!errors.gender)} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} />} />
                  <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.sport} isRequired>
                  <FormLabel>Sport</FormLabel>
                  <Controller name="sport" control={control} render={({ field }) => <Select {...field} options={(SPORTS[genderValue] || []).map(s => ({ label: s, value: s }))} styles={selectStyles(!!errors.sport)} value={field.value ? { label: field.value, value: field.value } : null} onChange={val => field.onChange(val ? val.value : '')} isDisabled={!genderValue} />} />
                  <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.graduation_year} isRequired>
                  <FormLabel>Graduation Year</FormLabel>
                  <Controller name="graduation_year" control={control} render={({ field }) => <NumberInput {...field} value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField /></NumberInput>} />
                  <FormErrorMessage>{errors.graduation_year?.message}</FormErrorMessage>
                </FormControl>
                 <FormControl isInvalid={!!errors.gpa}>
                  <FormLabel>GPA (optional)</FormLabel>
                  <Input {...register('gpa')} />
                  <FormErrorMessage>{errors.gpa?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.age}>
                  <FormLabel>Age (optional)</FormLabel>
                   <Controller name="age" control={control} render={({ field }) => <NumberInput {...field} value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField /></NumberInput>} />
                  <FormErrorMessage>{errors.age?.message}</FormErrorMessage>
                </FormControl>
                 <FormControl isInvalid={!!errors.prior_nil_deals}>
                  <FormLabel>Prior NIL Deals (optional)</FormLabel>
                   <Controller name="prior_nil_deals" control={control} render={({ field }) => <NumberInput {...field} min={0} value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField /></NumberInput>} />
                  <FormErrorMessage>{errors.prior_nil_deals?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
          </Stack>
          <Flex mt={8} justify="space-between">
            <Button onClick={handleBack} variant="outline">Back</Button>
            <Button onClick={handleNext}>{step === STEPS_CONFIG.length - 1 ? 'Continue' : 'Next'}</Button>
          </Flex>
        </form>
      </Stack>
    </Flex>
  );
}
