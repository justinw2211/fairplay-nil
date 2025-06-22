// src/pages/SignUp.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // FIX: Corrected file extension
import {
  Box, Button, Flex, Heading, Stack, FormControl,
  FormLabel, Input, Select, useToast, FormErrorMessage
} from '@chakra-ui/react';

// TODO: Integrate reCAPTCHA v3
export default function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      // Structure the data for Supabase Auth
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
            sports: data.sports ? [data.sports] : null,
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
      // Don't redirect immediately, user must confirm email
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
      <Box
        w={["95vw", "600px"]}
        bg="brand.background"
        boxShadow="xl"
        borderRadius="xl"
        p={[4, 8]}
        mx="auto"
        border="1px solid"
        borderColor="brand.accentSecondary"
      >
        <Heading as="h1" size="lg" mb={6} color="brand.textPrimary" textAlign="center">
          Create Your FairPlay Account
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={errors.full_name}>
              <FormLabel>Full Name</FormLabel>
              <Input {...register('full_name', { required: 'Full name is required' })} />
              <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.email}>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" {...register('email', { required: 'Email is required' })} />
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <Input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.role}>
              <FormLabel>I am a...</FormLabel>
              <Select {...register('role', { required: 'Please select a role' })} placeholder="Select your role">
                <option value="athlete">Student-Athlete</option>
                <option value="representative">Athlete Representative</option>
                <option value="collective">Collective</option>
                <option value="university">University</option>
                <option value="brand">Brand</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            {selectedRole === 'athlete' && (
              <>
                <Heading size="md" pt={4} borderTop="1px solid" borderColor="brand.accentSecondary">Athlete Details</Heading>
                <FormControl><FormLabel>School</FormLabel><Input {...register('school')} /></FormControl>
                <FormControl><FormLabel>Division</FormLabel><Input {...register('division')} /></FormControl>
                <FormControl><FormLabel>Gender</FormLabel><Input {...register('gender')} /></FormControl>
                <FormControl><FormLabel>Sport(s)</FormLabel><Input {...register('sports')} /></FormControl>
                <FormControl><FormLabel>Graduation Year</FormLabel><Input type="number" {...register('graduation_year')} /></FormControl>
              </>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              mt={4}
              w="100%"
              size="lg"
            >
              Sign Up
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}