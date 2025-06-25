// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// *** BUG FIX: Import useNavigate from react-router-dom ***
import { useNavigate } from 'react-router-dom'; 
import {
  Box, Button, FormControl, FormLabel, FormErrorMessage, Input, VStack, Heading, useToast, Select, Container, Flex, Spinner
} from '@chakra-ui/react';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS } from '../data/formConstants.js';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';

// The validation schema remains unchanged.
const schema = yup.object().shape({
  full_name: yup.string().required('Full name is required'),
  division: yup.string().required('NCAA Division is required'),
  university: yup.string().required('University is required'),
  gender: yup.string().required('Gender is required'),
  sport: yup.string().required('Sport is required'),
});

const EditProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  // *** BUG FIX: Initialize the navigate function ***
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const isInitialLoad = useRef(true);

  const {
    control, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { full_name: '', division: '', university: '', gender: '', sport: '' }
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  // This useEffect hook fetches the user's profile when the component mounts.
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          reset(data); // Populate the form with the fetched profile data.
        } else if (error && error.code !== 'PGRST116') {
          toast({ title: 'Error fetching profile', description: error.message, status: 'error' });
        }
        setLoading(false);
        isInitialLoad.current = false;
      };
      fetchProfile();
    }
  }, [user, reset, toast]);
  
  // This useEffect hook filters the list of schools based on the selected division.
  useEffect(() => {
    if (selectedDivision) {
      setFilteredSchools(NCAA_SCHOOL_OPTIONS.filter(school => school.division === selectedDivision));
      if (!isInitialLoad.current) {
        setValue('university', ''); // Reset university when division changes.
      }
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision, setValue]);
  
  // This useEffect hook filters the list of sports based on the selected gender.
  useEffect(() => {
    if (selectedGender === 'Male') {
      setAvailableSports(MEN_SPORTS);
    } else if (selectedGender === 'Female') {
      setAvailableSports(WOMEN_SPORTS);
    } else {
      setAvailableSports([]);
    }
    if (!isInitialLoad.current) {
      setValue('sport', ''); // Reset sport when gender changes.
    }
  }, [selectedGender, setValue]);

  // This function handles the form submission.
  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.from('profiles').update({ ...data }).eq('id', user.id);
      if (error) throw error;
      // Show a success notification.
      toast({
        title: 'Profile updated.', description: 'Your profile has been successfully updated.', status: 'success', duration: 5000, isClosable: true,
      });
      // *** BUG FIX: Navigate the user to the dashboard after a successful update. ***
      // A short delay allows the user to read the toast message before redirecting.
      setTimeout(() => navigate('/dashboard'), 1500); 

    } catch (error) {
      // Show an error notification if the update fails.
      toast({
        title: 'Update failed.', description: error.message, status: 'error', duration: 9000, isClosable: true,
      });
    }
  };

  // Display a spinner while the profile data is loading.
  if (loading) { return (<Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>); }

  // Render the form.
  return (
    <Container maxW="container.md" py={12}>
      <Box bg="brand.background" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} as="form" onSubmit={handleSubmit(onSubmit)}>
          <Heading as="h1" color="brand.textPrimary">Edit Profile</Heading>
          <Controller name="full_name" control={control} render={({ field }) => (<FormControl isInvalid={errors.full_name}><FormLabel>Full Name</FormLabel><Input {...field} /><FormErrorMessage>{errors.full_name?.message}</FormErrorMessage></FormControl>)} />
          <Controller name="division" control={control} render={({ field }) => (<FormControl isInvalid={errors.division}><FormLabel>NCAA Division</FormLabel><Select {...field} placeholder="Select Division"><option value="D1">Division I</option><option value="D2">Division II</option><option value="D3">Division III</option></Select><FormErrorMessage>{errors.division?.message}</FormErrorMessage></FormControl>)} />
          <Controller name="university" control={control} render={({ field }) => (<FormControl isInvalid={errors.university}><FormLabel>University</FormLabel><Select {...field} placeholder="Select University" isDisabled={!selectedDivision}>{filteredSchools.map(school => (<option key={school.value} value={school.value}>{school.label}</option>))}</Select><FormErrorMessage>{errors.university?.message}</FormErrorMessage></FormControl>)} />
          <Controller name="gender" control={control} render={({ field }) => (<FormControl isInvalid={errors.gender}><FormLabel>Gender</FormLabel><Select {...field} placeholder="Select Gender">{GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</Select><FormErrorMessage>{errors.gender?.message}</FormErrorMessage></FormControl>)} />
          <Controller name="sport" control={control} render={({ field }) => (<FormControl isInvalid={errors.sport}><FormLabel>Sport</FormLabel><Select {...field} placeholder="Select Sport" isDisabled={!selectedGender}>{availableSports.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select><FormErrorMessage>{errors.sport?.message}</FormErrorMessage></FormControl>)} />
          <Button type="submit" colorScheme="pink" bg="brand.accentPrimary" color="white" isLoading={isSubmitting} width="full" _hover={{ bg: '#c8aeb0' }}>Save Changes</Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default EditProfile;