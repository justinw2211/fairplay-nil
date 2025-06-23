// src/pages/SignUp.jsx
import React, { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Box, Button, Flex, Heading, Stack, FormControl,
  FormLabel, Input, useToast, FormErrorMessage, NumberInput, NumberInputField
} from '@chakra-ui/react';
import ReactSelect from "react-select";
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, COMBINED_SPORTS } from '../data/formConstants.js';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "#ffffff",
    borderColor: state.isFocused ? "#d0bdb5" : "#d6dce4",
    boxShadow: state.isFocused ? "0 0 0 1px #d0bdb5" : "none",
    "&:hover": { borderColor: "#d0bdb5" },
  }),
  menu: (base) => ({ ...base, zIndex: 99 }),
};

const DIVISIONS = [{label: "I", value: "I"}, {label: "II", value: "II"}, {label: "III", value: "III"}];

export default function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  
  const selectedRole = watch('role');
  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  const schoolOptions = useMemo(() => {
    if (!selectedDivision) return [];
    return NCAA_SCHOOL_OPTIONS.filter(o => o.division === selectedDivision);
  }, [selectedDivision]);

  const sportOptions = useMemo(() => {
    if (selectedGender === 'Male') return MEN_SPORTS;
    if (selectedGender === 'Female') return WOMEN_SPORTS;
    if (['Nonbinary', 'Prefer not to say', 'Other'].includes(selectedGender)) {
      return COMBINED_SPORTS;
    }
    return [];
  }, [selectedGender]);

  useEffect(() => {
    setValue('sports', []); // Clear sports when gender changes
  }, [selectedGender, setValue]);

  const onSubmit = async (data) => {
    try {
      const { error } = await signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            school: data.school || null,
            division: data.division || null,
            gender: data.gender || null,
            graduation_year: data.graduation_year ? parseInt(data.graduation_year, 10) : null,
            sports: data.sports || [],
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Account created.',
        description: "We've sent a confirmation link to your email.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error signing up.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="90vh" align="center" justify="center" bg="brand.backgroundLight">
      <Box w={["95vw", "600px"]} bg="brand.background" boxShadow="xl" borderRadius="xl" p={[4, 8]} mx="auto" border="1px solid" borderColor="brand.accentSecondary">
        <Heading as="h1" size="lg" mb={6} color="brand.textPrimary" textAlign="center">
          Create Your FairPlay Account
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={errors.full_name}><FormLabel>Full Name</FormLabel><Input {...register('full_name', { required: 'Full name is required' })} /></FormControl>
            <FormControl isInvalid={errors.email}><FormLabel>Email Address</FormLabel><Input type="email" {...register('email', { required: 'Email is required' })} /></FormControl>
            <FormControl isInvalid={errors.password}><FormLabel>Password</FormLabel><Input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} /></FormControl>
            <FormControl isInvalid={errors.role}><FormLabel>I am a...</FormLabel><Controller name="role" control={control} rules={{ required: 'Please select a role' }} render={({ field }) => (<ReactSelect options={[{ value: 'athlete', label: 'Student-Athlete' }, { value: 'representative', label: 'Athlete Representative' }, { value: 'collective', label: 'Collective' }, { value: 'university', label: 'University' }, { value: 'brand', label: 'Brand' }, { value: 'other', label: 'Other' }]} value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1).replace("_", " ") } : null} onChange={(val) => field.onChange(val ? val.value : '')} styles={selectStyles} placeholder="Select your role"/>)}/></FormControl>

            {selectedRole === 'athlete' && (
              <>
                <Heading size="md" pt={4} borderTop="1px solid" borderColor="brand.accentSecondary">Athlete Details</Heading>
                <FormControl isInvalid={errors.division}><FormLabel>Division</FormLabel><Controller name="division" control={control} render={({ field }) => (<ReactSelect {...field} options={DIVISIONS} value={DIVISIONS.find(d => d.value === field.value)} onChange={val => { field.onChange(val.value); setValue('school', null); }} styles={selectStyles} placeholder="Select division..."/>)}/></FormControl>
                <FormControl isInvalid={errors.school}><FormLabel>School</FormLabel><Controller name="school" control={control} render={({ field }) => (<ReactSelect {...field} options={schoolOptions} value={schoolOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val.value)} isDisabled={!selectedDivision} isSearchable styles={selectStyles} placeholder="Type to search your school..."/>)}/></FormControl>
                <FormControl isInvalid={errors.gender}><FormLabel>Gender</FormLabel><Controller name="gender" control={control} render={({ field }) => (<ReactSelect options={GENDERS} value={GENDERS.find(g => g.value === field.value)} onChange={val => field.onChange(val.value)} styles={selectStyles} placeholder="Select gender..."/>)}/></FormControl>
                <FormControl isInvalid={errors.sports}><FormLabel>Sport(s)</FormLabel>
                  <Controller 
                    name="sports" 
                    control={control} 
                    render={({ field }) => (
                      <ReactSelect 
                        isMulti 
                        options={sportOptions} 
                        // THE FIX: value prop now correctly finds the object(s)
                        value={sportOptions.filter(option => Array.isArray(field.value) && field.value.includes(option.value))}
                        // THE FIX: Correctly map the array of objects to an array of strings
                        onChange={val => field.onChange(val ? val.map(c => c.value) : [])} 
                        isDisabled={!selectedGender} 
                        styles={selectStyles} 
                        placeholder="Select sports..."
                      />
                    )}
                  />
                </FormControl>
                <FormControl isInvalid={errors.graduation_year}><FormLabel>Graduation Year</FormLabel><Controller name="graduation_year" control={control} render={({ field }) => (<NumberInput {...field} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={2024} max={2035}><NumberInputField placeholder="2026" /></NumberInput>)}/></FormControl>
              </>
            )}

            <Button type="submit" isLoading={isSubmitting} mt={4} w="100%" size="lg">Sign Up</Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}