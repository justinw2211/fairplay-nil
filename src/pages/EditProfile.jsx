// src/pages/EditProfile.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../supabaseClient.js';
import {
  Box, Button, Flex, Heading, Stack, FormControl, FormLabel,
  Input, Spinner, useToast, FormErrorMessage, NumberInput, NumberInputField
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ReactSelect from "react-select";
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, COMBINED_SPORTS } from '../data/formConstants.js';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';

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

export default function EditProfile() {
    const { register, handleSubmit, reset, control, watch, setValue, formState: { isSubmitting, errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    const selectedDivision = watch('division');
    const selectedGender = watch('gender');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (error) {
                    toast({ title: "Error fetching profile", description: error.message, status: "error" });
                } else {
                    setProfile(data);
                    // Pre-fill form with profile data, ensuring sports is an array
                    reset({
                        ...data,
                        sports: data.sports || [],
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [reset, toast]);
    
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
    
    // Effect to clear school if division changes, and sports if gender changes
    useEffect(() => {
        setValue('school', null);
    }, [selectedDivision, setValue]);
    useEffect(() => {
        setValue('sports', []);
    }, [selectedGender, setValue]);

    const onSubmit = async (data) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    school: data.school,
                    division: data.division,
                    gender: data.gender,
                    sports: data.sports, // This is now correctly an array
                    graduation_year: data.graduation_year ? parseInt(data.graduation_year, 10) : null,
                })
                .eq('id', profile.id);

            if (error) throw error;
            
            toast({ title: "Profile updated successfully!", status: "success", duration: 3000, isClosable: true });
            navigate('/dashboard');
        } catch (error) {
            toast({ title: "Error updating profile", description: error.message, status: "error", duration: 5000, isClosable: true });
        }
    };
    
    if (loading) {
        return <Flex justify="center" align="center" h="80vh"><Spinner size="xl" /></Flex>;
    }
    
    return (
        <Flex minH="90vh" align="center" justify="center" bg="brand.backgroundLight">
            <Box w={["95vw", "600px"]} bg="white" boxShadow="xl" borderRadius="xl" p={8} border="1px solid" borderColor="brand.accentSecondary">
                <Heading as="h1" size="lg" mb={6} color="brand.textPrimary">Edit Your Profile</Heading>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        <FormControl isInvalid={errors.full_name}>
                            <FormLabel color="brand.textSecondary">Full Name</FormLabel>
                            <Input {...register('full_name', { required: "Full name is required" })} />
                            <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
                        </FormControl>
                        {profile?.role === 'athlete' && (
                             <>
                                <FormControl isInvalid={errors.division}><FormLabel color="brand.textSecondary">Division</FormLabel><Controller name="division" control={control} render={({ field }) => (<ReactSelect options={DIVISIONS} value={DIVISIONS.find(d => d.value === field.value)} onChange={val => field.onChange(val.value)} styles={selectStyles} placeholder="Select division..."/>)}/></FormControl>
                                <FormControl isInvalid={errors.school}><FormLabel color="brand.textSecondary">School</FormLabel><Controller name="school" control={control} render={({ field }) => (<ReactSelect options={schoolOptions} value={schoolOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val.value)} isDisabled={!selectedDivision} isSearchable styles={selectStyles} placeholder="Type to search your school..."/>)}/></FormControl>
                                <FormControl isInvalid={errors.gender}><FormLabel color="brand.textSecondary">Gender</FormLabel><Controller name="gender" control={control} render={({ field }) => (<ReactSelect options={GENDERS} value={GENDERS.find(g => g.value === field.value)} onChange={val => field.onChange(val.value)} styles={selectStyles} placeholder="Select gender..."/>)}/></FormControl>
                                <FormControl isInvalid={errors.sports}><FormLabel color="brand.textSecondary">Sport(s)</FormLabel><Controller name="sports" control={control} render={({ field }) => (<ReactSelect isMulti options={sportOptions} value={sportOptions.filter(s => field.value?.includes(s.value))} onChange={val => field.onChange(val.map(c => c.value))} isDisabled={!selectedGender} styles={selectStyles} placeholder="Select sports..."/>)}/></FormControl>
                                <FormControl isInvalid={errors.graduation_year}><FormLabel color="brand.textSecondary">Graduation Year</FormLabel><Controller name="graduation_year" control={control} render={({ field }) => (<NumberInput {...field} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={2024} max={2035}><NumberInputField placeholder="2026" /></NumberInput>)}/></FormControl>
                            </>
                        )}
                        <Flex justify="space-between" mt={6}>
                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
                            <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                        </Flex>
                    </Stack>
                </form>
            </Box>
        </Flex>
    );
}