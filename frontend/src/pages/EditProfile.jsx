// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  useToast,
  Select,
  Container,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS } from '../data/formConstants.js';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';

const schema = yup.object().shape({
  full_name: yup.string().required('Full name is required'),
  division: yup.string().required('NCAA Division is required'),
  school: yup.string().required('University is required'),
  gender: yup.string().required('Gender is required'),
  sports: yup.array().min(1, 'At least one sport is required').of(yup.string()).required(),
  graduation_year: yup.number().typeError('Please enter a valid year').required('Graduation year is required').min(2024).max(2035),
});

const EditProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  
  // Use useRef to track if this is the initial data load
  const isInitialLoad = useRef(true);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: '',
      division: '',
      school: '',
      gender: '',
      sports: [],
      graduation_year: '',
    }
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          // Set the form values with data from the database
          reset({
            ...data,
            sports: data.sports || [], // Ensure sports is always an array
          });
        } else if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
            toast({ title: 'Error fetching profile', description: error.message, status: 'error' });
        }
        setLoading(false);
        // After the first successful load, set the ref to false
        isInitialLoad.current = false; 
      };
      fetchProfile();
    }
  }, [user, reset, toast]);

  useEffect(() => {
    if (selectedDivision) {
      setFilteredSchools(NCAA_SCHOOL_OPTIONS.filter(s => s.division === selectedDivision));
      // On division change (after initial load), reset the university
      if (!isInitialLoad.current) {
        setValue('school', '');
      }
    }
  }, [selectedDivision, setValue]);

  useEffect(() => {
    if (selectedGender === 'Male') {
      setAvailableSports(MEN_SPORTS);
    } else if (selectedGender === 'Female') {
      setAvailableSports(WOMEN_SPORTS);
    } else {
      setAvailableSports([]);
    }
    // On gender change (after initial load), reset the sport to ensure data consistency
    if (!isInitialLoad.current) {
        setValue('sports', []);
    }
  }, [selectedGender, setValue]);


  const onSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          division: data.division,
          school: data.school,
          gender: data.gender,
          sports: data.sports,
          graduation_year: data.graduation_year,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated.',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed.',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
        <Flex justify="center" align="center" minH="50vh">
            <Spinner size="xl" />
        </Flex>
    );
  }

  return (
    <Container maxW="container.md" py={12}>
      <Box bg="brand.background" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} as="form" onSubmit={handleSubmit(onSubmit)}>
          <Heading as="h1" color="brand.textPrimary">Edit Profile</Heading>
          
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.full_name}>
                <FormLabel>Full Name</FormLabel>
                <Input {...field} />
                <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          <Controller
            name="division"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.division}>
                <FormLabel>NCAA Division</FormLabel>
                <Select {...field} placeholder="Select Division">
                  <option value="I">Division I</option>
                  <option value="II">Division II</option>
                  <option value="III">Division III</option>
                </Select>
                <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          <Controller
            name="school"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.school}>
                <FormLabel>University</FormLabel>
                <Select {...field} placeholder="Select University" isDisabled={!selectedDivision}>
                  {filteredSchools.map(school => (
                    <option key={school.value} value={school.value}>{school.label}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.school?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          
          <Controller
            name="graduation_year"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.graduation_year}>
                <FormLabel>Graduation Year</FormLabel>
                <Input {...field} type="number" placeholder="e.g., 2025" />
                <FormErrorMessage>{errors.graduation_year?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.gender}>
                <FormLabel>Gender</FormLabel>
                <Select {...field} placeholder="Select Gender">
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </Select>
                <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          {/* This is a simplified multi-select; for a better UX, a multi-select component would be ideal */}
          <Controller
            name="sports"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.sports}>
                <FormLabel>Sport(s) - Select one or more</FormLabel>
                <Select {...field} multiple size={5} isDisabled={!selectedGender}>
                  {availableSports.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <FormErrorMessage>{errors.sports?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          <Button
            type="submit"
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            isLoading={isSubmitting}
            width="full"
            _hover={{ bg: '#c8aeb0' }}
          >
            Save Changes
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default EditProfile;