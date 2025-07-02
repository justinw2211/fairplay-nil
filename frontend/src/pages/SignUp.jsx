// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Select,
  Link,
  Flex
} from '@chakra-ui/react';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS } from '../data/formConstants';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools';

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  division: yup.string().required('NCAA Division is required'),
  university: yup.string().required('University is required'),
  gender: yup.string().required('Gender is required'),
  sport: yup.string().required('Sport is required'),
});

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  useEffect(() => {
    if (selectedDivision) {
      setFilteredSchools(NCAA_SCHOOL_OPTIONS.filter(school => school.division === selectedDivision));
      setValue('university', '');
    } else {
      setFilteredSchools([]);
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
    setValue('sport', '');
  }, [selectedGender, setValue]);

  const onSubmit = async (data) => {
    try {
      // First, create the user with Supabase Auth
      const { data: authData, error: signUpError } = await signUp(
        data.email, 
        data.password,
        {
          full_name: data.fullName,
          university: data.university,
          sport: data.sport,
          role: 'athlete'  // Default role for new users
        }
      );

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          toast({
            title: 'Account Exists',
            description: "An account with this email already exists. Please log in.",
            status: 'warning',
            duration: 7000,
            isClosable: true,
          });
          navigate('/login');
          return;
        }
        throw signUpError;
      }

      if (authData) {
        toast({
          title: 'Account created successfully!',
          description: "Please check your email to confirm your account.",
          status: 'success',
          duration: 7000,
          isClosable: true,
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('SignUp error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up. Please try again.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.backgroundLight">
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="brand.background">
        <VStack spacing={4}>
          <Heading color="brand.textPrimary">Create an Account</Heading>
          <Text color="brand.textSecondary">Join FairPlay NIL to manage your deals with confidence.</Text>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <VStack spacing={4}>
                <Controller name="fullName" control={control} render={({ field }) => (<FormControl isInvalid={errors.fullName}><FormLabel>Full Name</FormLabel><Input {...field} /><FormErrorMessage>{errors.fullName?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="email" control={control} render={({ field }) => (<FormControl isInvalid={errors.email}><FormLabel>Email Address</FormLabel><Input {...field} type="email" /><FormErrorMessage>{errors.email?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="password" control={control} render={({ field }) => (<FormControl isInvalid={errors.password}><FormLabel>Password</FormLabel><Input {...field} type="password" /><FormErrorMessage>{errors.password?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="division" control={control} render={({ field }) => (<FormControl isInvalid={errors.division}><FormLabel>NCAA Division</FormLabel><Select {...field} placeholder="Select Division"><option value="D1">Division I</option><option value="D2">Division II</option><option value="D3">Division III</option></Select><FormErrorMessage>{errors.division?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="university" control={control} render={({ field }) => (<FormControl isInvalid={errors.university}><FormLabel>University</FormLabel><Select {...field} placeholder="Select University" isDisabled={!selectedDivision}>{filteredSchools.map(school => (<option key={school.value} value={school.value}>{school.label}</option>))}</Select><FormErrorMessage>{errors.university?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="gender" control={control} render={({ field }) => (<FormControl isInvalid={errors.gender}><FormLabel>Gender</FormLabel><Select {...field} placeholder="Select Gender">{GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</Select><FormErrorMessage>{errors.gender?.message}</FormErrorMessage></FormControl>)} />
                <Controller name="sport" control={control} render={({ field }) => (<FormControl isInvalid={errors.sport}><FormLabel>Sport</FormLabel><Select {...field} placeholder="Select Sport" isDisabled={!selectedGender}>{availableSports.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select><FormErrorMessage>{errors.sport?.message}</FormErrorMessage></FormControl>)} />
              <Button type="submit" colorScheme="pink" bg="brand.accentPrimary" color="white" width="full" isLoading={isSubmitting} _hover={{ bg: '#c8aeb0' }}>Sign Up</Button>
            </VStack>
          </form>
          <Text mt={4} color="brand.textSecondary">Already have an account?{' '}<Link as={RouterLink} to="/login" color="brand.accentPrimary" fontWeight="bold">Sign In</Link></Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignUp;