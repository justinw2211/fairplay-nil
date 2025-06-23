// src/pages/EditProfile.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
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
  menu: (base) => ({ ...base, zIndex: 9999, border: "1px solid #d6dce4" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#d0bdb5" : state.isFocused ? "#f4f4f4" : "transparent",
    color: state.isSelected ? "#ffffff" : "#282f3d",
  }),
};

const DIVISIONS = [{label: "I", value: "I"}, {label: "II", value: "II"}, {label: "III", value: "III"}];

export default function EditProfile() {
    const { user } = useAuth();
    const { register, handleSubmit, reset, control, watch, setValue, formState: { isSubmitting, errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    const selectedDivision = watch('division');
    const selectedGender = watch('gender');

    useEffect(() => {
        const fetchAndSetProfile = async () => {
            if (!user) {
                setLoading(false);
                toast({ title: "You must be logged in to edit a profile.", status: "error", duration: 4000, isClosable: true });
                navigate('/login');
                return;
            }

            setLoading(true);
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                toast({ title: "Error fetching profile data", description: error.message, status: "error", duration: 5000, isClosable: true });
            }

            const initialData = {
                full_name: profileData?.full_name || user.user_metadata?.full_name || '',
                division: profileData?.division || null,
                school: profileData?.school || null,
                gender: profileData?.gender || null,
                sports: profileData?.sports || [],
                graduation_year: profileData?.graduation_year || null,
            };
            
            reset(initialData);
            setLoading(false);
        };
        
        fetchAndSetProfile();
    }, [user, reset, toast, navigate]);

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

    const onSubmit = async (formData) => {
        if (!user) {
            toast({ title: "Authentication error", description: "You are not logged in.", status: "error" });
            return;
        }

        try {
            // This payload now ONLY includes fields managed by this form.
            const profilePayload = {
                id: user.id, // The primary key for upsert
                full_name: formData.full_name,
                school: formData.school,
                division: formData.division,
                gender: formData.gender,
                sports: formData.sports,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null,
            };
            
            const { error } = await supabase
                .from('profiles')
                .upsert(profilePayload)
                .select()
                .single();

            if (error) throw error;
            
            toast({ title: "Profile saved successfully!", status: "success", duration: 3000, isClosable: true });
            navigate('/dashboard');
        } catch (error) {
            toast({ title: "Error saving profile", description: error.message, status: "error", duration: 5000, isClosable: true });
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
                        
                        <FormControl isInvalid={errors.division}><FormLabel color="brand.textSecondary">Division</FormLabel><Controller name="division" control={control} render={({ field }) => (<ReactSelect options={DIVISIONS} value={DIVISIONS.find(d => d.value === field.value)} onChange={val => { field.onChange(val?.value || null); setValue('school', null); }} styles={selectStyles} placeholder="Select division..." isClearable/>)}/></FormControl>
                        <FormControl isInvalid={errors.school}><FormLabel color="brand.textSecondary">School</FormLabel><Controller name="school" control={control} render={({ field }) => (<ReactSelect options={schoolOptions} value={schoolOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value || null)} isDisabled={!selectedDivision} isSearchable styles={selectStyles} placeholder="Type to search your school..." isClearable/>)}/></FormControl>
                        <FormControl isInvalid={errors.gender}><FormLabel color="brand.textSecondary">Gender</FormLabel><Controller name="gender" control={control} render={({ field }) => (<ReactSelect options={GENDERS} value={GENDERS.find(g => g.value === field.value)} onChange={val => { field.onChange(val?.value || null); setValue('sports', []); }} styles={selectStyles} placeholder="Select gender..." isClearable/>)}/></FormControl>
                        <FormControl isInvalid={errors.sports}><FormLabel color="brand.textSecondary">Sport(s)</FormLabel><Controller name="sports" control={control} render={({ field }) => (<ReactSelect isMulti options={sportOptions} value={sportOptions.filter(s => Array.isArray(field.value) && field.value.includes(s.value))} onChange={val => field.onChange(val.map(c => c.value))} isDisabled={!selectedGender} styles={selectStyles} placeholder="Select sports..."/>)}/></FormControl>
                        <FormControl isInvalid={errors.graduation_year}><FormLabel color="brand.textSecondary">Graduation Year</FormLabel><Controller name="graduation_year" control={control} render={({ field }) => (<NumberInput value={field.value || ''} onChange={(val) => field.onChange(val === '' ? null : Number(val))} min={2024} max={2035}><NumberInputField placeholder="2026" /></NumberInput>)}/></FormControl>
                        
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