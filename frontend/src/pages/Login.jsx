// src/pages/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // FIX: Corrected file extension
import {
  Box, Button, Flex, Heading, Stack, FormControl,
  FormLabel, Input, useToast, FormErrorMessage
} from '@chakra-ui/react';

// TODO: Integrate reCAPTCHA v3
export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const { error } = await signIn({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      toast({
        title: 'Error signing in.',
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
        w={["95vw", "500px"]}
        bg="brand.background"
        boxShadow="xl"
        borderRadius="xl"
        p={[4, 8]}
        mx="auto"
        border="1px solid"
        borderColor="brand.accentSecondary"
      >
        <Heading as="h1" size="lg" mb={6} color="brand.textPrimary" textAlign="center">
          Sign In to FairPlay
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" {...register('email', { required: 'Email is required' })} />
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <Input type="password" {...register('password', { required: 'Password is required' })} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              isLoading={isSubmitting}
              mt={4}
              w="100%"
              size="lg"
            >
              Sign In
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}