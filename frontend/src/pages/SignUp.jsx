// frontend/src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const watchedPassword = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        role: data.role,
      });

      if (error) {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Account Created!',
        description: 'Welcome to FairPlay NIL',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.backgroundLight">
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="brand.background">
        <VStack spacing={6}>
          <Heading color="brand.textPrimary">Create an Account</Heading>
          <Text color="brand.textSecondary" textAlign="center">
            Join FairPlay NIL to manage your deals with confidence.
          </Text>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <VStack spacing={4} width="100%">
              <FormControl isInvalid={errors.email}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  placeholder="Enter your password"
                />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watchedPassword || 'Passwords do not match',
                  })}
                  placeholder="Confirm your password"
                />
                <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.role}>
                <FormLabel>What best describes you?</FormLabel>
                <Select
                  {...register('role', {
                    required: 'Please select your role',
                  })}
                  placeholder="Select your role"
                >
                  <option value="student-athlete">Student-Athlete</option>
                  <option value="agent">Agent</option>
                  <option value="coach">Coach</option>
                  <option value="university">University</option>
                  <option value="collective">Collective</option>
                  <option value="brand">Brand</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                width="full"
                size="lg"
                isLoading={isLoading}
                loadingText="Creating Account..."
                _hover={{ bg: '#c8aeb0' }}
              >
                Create Account
              </Button>

              <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                Already have an account?{' '}
                <Link as={RouterLink} to="/login" color="brand.accentPrimary" fontWeight="medium">
                  Sign in
                </Link>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignUp;