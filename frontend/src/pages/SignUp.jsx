// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect } from 'react';
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
  Progress,
  Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';

const USER_ROLES = [
  { value: 'student-athlete', label: 'Student-Athlete' },
  { value: 'agent', label: 'Agent' },
  { value: 'coach', label: 'Coach' },
  { value: 'university', label: 'University' },
  { value: 'collective', label: 'Collective' },
  { value: 'brand', label: 'Brand' },
  { value: 'other', label: 'Other' }
];

const GENDERS = ['Male', 'Female', 'Nonbinary', 'Prefer not to say', 'Other'];

const MEN_SPORTS = [
  'Baseball', 'Basketball', 'Cross Country', 'Football', 'Golf', 'Soccer', 'Tennis', 'Track & Field'
];

const WOMEN_SPORTS = [
  'Basketball', 'Cross Country', 'Golf', 'Soccer', 'Softball', 'Tennis', 'Track & Field', 'Volleyball'
];

const NCAA_DIVISIONS = ['Division I', 'Division II', 'Division III'];

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [initialData, setInitialData] = useState(null);
  const [availableSports, setAvailableSports] = useState([]);

  // Step 1 form
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    watch: watch1,
  } = useForm();

  // Step 2 form
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    watch: watch2,
    setValue: setValue2,
  } = useForm();

  const watchedPassword = watch1('password');
  const selectedGender = watch2('gender');

  // Update available sports when gender changes
  useEffect(() => {
    if (selectedGender === 'Male') {
      setAvailableSports(MEN_SPORTS.map(sport => ({ value: sport, label: sport })));
    } else if (selectedGender === 'Female') {
      setAvailableSports(WOMEN_SPORTS.map(sport => ({ value: sport, label: sport })));
    } else {
      setAvailableSports([]);
    }
    setValue2('sports', []);
  }, [selectedGender, setValue2]);

  const onSubmitStep1 = async (data) => {
    setInitialData(data);
    
    if (data.role === 'student-athlete') {
      setStep(2);
    } else {
      // For non-athletes, create account immediately
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
    }
  };

  const onSubmitStep2 = async (data) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(initialData.email, initialData.password, {
        role: 'student-athlete',
        full_name: data.full_name,
        phone: data.phone,
        division: data.division,
        university: data.university,
        gender: data.gender,
        sports: data.sports,
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
            {step === 1 
              ? "Join FairPlay NIL to manage your deals with confidence."
              : "Tell us more about yourself to complete your profile."}
          </Text>

          {step === 2 && (
            <Progress value={50} size="sm" width="100%" colorScheme="pink" borderRadius="full" />
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit1(onSubmitStep1)} style={{ width: '100%' }}>
              <VStack spacing={4} width="100%">
                <FormControl isInvalid={errors1.email}>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    {...register1('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    placeholder="Enter your email"
                  />
                  <FormErrorMessage>{errors1.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors1.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    {...register1('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    placeholder="Enter your password"
                  />
                  <FormErrorMessage>{errors1.password?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors1.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    {...register1('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === watchedPassword || 'Passwords do not match',
                    })}
                    placeholder="Confirm your password"
                  />
                  <FormErrorMessage>{errors1.confirmPassword?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors1.role}>
                  <FormLabel>What best describes you?</FormLabel>
                  <Select
                    {...register1('role', {
                      required: 'Please select your role',
                    })}
                    placeholder="Select your role"
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors1.role?.message}</FormErrorMessage>
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
                  Continue
                </Button>

                <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                  Already have an account?{' '}
                  <Link as={RouterLink} to="/login" color="brand.accentPrimary" fontWeight="medium">
                    Sign in
                  </Link>
                </Text>
              </VStack>
            </form>
          ) : (
            <form onSubmit={handleSubmit2(onSubmitStep2)} style={{ width: '100%' }}>
              <VStack spacing={4} width="100%">
                <FormControl isInvalid={errors2.full_name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    {...register2('full_name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    placeholder="Enter your full name"
                  />
                  <FormErrorMessage>{errors2.full_name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors2.phone}>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    {...register2('phone', {
                      required: 'Phone number is required',
                    })}
                    placeholder="(555) 555-5555"
                  />
                  <FormErrorMessage>{errors2.phone?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors2.division}>
                  <FormLabel>NCAA Division</FormLabel>
                  <Select
                    {...register2('division', {
                      required: 'Please select your NCAA Division',
                    })}
                    placeholder="Select NCAA Division"
                  >
                    {NCAA_DIVISIONS.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors2.division?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors2.university}>
                  <FormLabel>University</FormLabel>
                  <Input
                    {...register2('university', {
                      required: 'University is required',
                    })}
                    placeholder="Enter your university"
                  />
                  <FormErrorMessage>{errors2.university?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors2.gender}>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    {...register2('gender', {
                      required: 'Please select your gender',
                    })}
                    placeholder="Select your gender"
                  >
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors2.gender?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors2.sports}>
                  <FormLabel>Sports</FormLabel>
                  <ReactSelect
                    {...register2('sports', {
                      required: 'Please select at least one sport',
                    })}
                    options={availableSports}
                    isMulti
                    placeholder="Select your sports..."
                    onChange={(selectedOptions) => {
                      setValue2('sports', selectedOptions || []);
                    }}
                  />
                  <FormErrorMessage>{errors2.sports?.message}</FormErrorMessage>
                  {!selectedGender && (
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Please select your gender first
                    </Text>
                  )}
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
                  Complete Sign Up
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  width="full"
                  size="lg"
                >
                  Back
                </Button>
              </VStack>
            </form>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignUp;