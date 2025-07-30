// frontend/src/pages/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  FormErrorMessage,
  Text,
  Link
} from '@chakra-ui/react';

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      // The data object from react-hook-form is in the correct format.
      const { error } = await signIn(data);
      if (error) {throw error;}
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
        p={8}
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
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
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
              colorScheme="pink"
              bg="brand.accentPrimary"
              color="white"
              _hover={{ bg: '#c8aeb0' }}
            >
              Sign In
            </Button>
          </Stack>
        </form>
        <Text mt={6} textAlign="center" color="brand.textSecondary">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/signup" color="brand.accentPrimary" fontWeight="bold">
              Sign Up
            </Link>
        </Text>
      </Box>
    </Flex>
  );
}