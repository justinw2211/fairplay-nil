// frontend/src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Select from 'react-select';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Heading,
  Text,
  useToast,
  Link,
  Flex,
  Progress,
  Select as ChakraSelect,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, NCAA_DIVISIONS, USER_ROLES } from '../data/formConstants';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools';

// Initial signup schema
const initialSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().required('Please select what best describes you'),
});

// Additional athlete info schema
const athleteSchema = yup.object().shape({
  full_name: yup.string().required('Full name is required'),
  phone: yup.string().required('Phone number is required'),
  division: yup.string().required('NCAA Division is required'),
  university: yup.string().required('University is required'),
  gender: yup.string().required('Gender is required'),
  sports: yup.array()
    .of(yup.string())
    .min(1, 'At least one sport is required')
    .required('At least one sport is required'),
});

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [initialData, setInitialData] = useState(null);

  // Form for initial signup
  const initialForm = useForm({
    resolver: yupResolver(initialSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    }
  });

  // Form for athlete additional info
  const athleteForm = useForm({
    resolver: yupResolver(athleteSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      division: '',
      university: '',
      gender: '',
      sports: [],
    }
  });

  const selectedDivision = athleteForm.watch('division');
  const selectedGender = athleteForm.watch('gender');

  // Handle division change
  React.useEffect(() => {
    if (selectedDivision) {
      const schools = NCAA_SCHOOL_OPTIONS.filter(
        school => school.division === selectedDivision
      );
      setFilteredSchools(schools);
      if (!schools.find(s => s.name === athleteForm.getValues('university'))) {
        athleteForm.setValue('university', '');
      }
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision]);

  // Handle gender change
  React.useEffect(() => {
    const sports = selectedGender === 'Male' ? MEN_SPORTS :
                  selectedGender === 'Female' ? WOMEN_SPORTS : [];
    setAvailableSports(sports);
    athleteForm.setValue('sports', []);
  }, [selectedGender]);

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3182ce' : '#E2E8F0',
      boxShadow: state.isFocused ? '0 0 0 1px #3182ce' : 'none',
      '&:hover': {
        borderColor: '#3182ce',
      },
      minHeight: '40px',
      backgroundColor: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3182ce' : state.isFocused ? '#EDF2F7' : 'white',
      color: state.isSelected ? 'white' : '#1A202C',
    }),
  };

  const handleInitialSubmit = async (data) => {
    try {
      setInitialData(data);
      
      if (data.role === 'student-athlete') {
        setStep(2);
      } else {
        // For non-athletes, create account and redirect to home
        const { error: signUpError } = await signUp(
          data.email,
          data.password,
          {
            role: data.role
          }
        );

        if (signUpError) throw signUpError;

        toast({
          title: 'Account created successfully!',
          description: "Welcome to FairPlay NIL!",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/');
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

  const handleAthleteSubmit = async (data) => {
    try {
      const { error: signUpError } = await signUp(
        initialData.email,
        initialData.password,
        {
          ...data,
          role: 'student-athlete'
        }
      );

      if (signUpError) throw signUpError;

      toast({
        title: 'Account created successfully!',
        description: "Welcome to FairPlay NIL!",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile update failed',
        description: error.message || 'An error occurred while updating your profile. Please try again.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
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
            <form onSubmit={initialForm.handleSubmit(handleInitialSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <Controller
                  name="email"
                  control={initialForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Email Address</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiMail} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="password"
                  control={initialForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create a password"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={initialForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Confirm Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your password"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="role"
                  control={initialForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>What best describes you?</FormLabel>
                      <Select
                        options={USER_ROLES}
                        styles={customStyles}
                        placeholder="Select your role"
                        onChange={(option) => onChange(option?.value)}
                        value={USER_ROLES.find(option => option.value === value)}
                        isSearchable={false}
                      />
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Button
                  type="submit"
                  colorScheme="pink"
                  bg="brand.accentPrimary"
                  color="white"
                  width="full"
                  size="lg"
                  isLoading={initialForm.formState.isSubmitting}
                  _hover={{ bg: '#c8aeb0' }}
                >
                  Continue
                </Button>
              </VStack>
            </form>
          ) : (
            <form onSubmit={athleteForm.handleSubmit(handleAthleteSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <Controller
                  name="full_name"
                  control={athleteForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Full Name</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiUser} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="phone"
                  control={athleteForm.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Phone Number</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiPhone} color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter your phone number"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="division"
                  control={athleteForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>NCAA Division</FormLabel>
                      <Select
                        options={NCAA_DIVISIONS.map(div => ({ value: div, label: div }))}
                        styles={customStyles}
                        placeholder="Select NCAA Division"
                        onChange={(option) => onChange(option?.value)}
                        value={value ? { value, label: value } : null}
                        isSearchable={false}
                      />
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="university"
                  control={athleteForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>University</FormLabel>
                      <Select
                        isDisabled={!selectedDivision}
                        options={filteredSchools.map(school => ({
                          value: school.name,
                          label: school.name
                        }))}
                        styles={customStyles}
                        placeholder="Search for your university..."
                        onChange={(option) => onChange(option?.value)}
                        value={value ? { value, label: value } : null}
                        isClearable
                      />
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                      {!selectedDivision && (
                        <FormHelperText>
                          Please select a division first
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="gender"
                  control={athleteForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        options={GENDERS.map(gender => ({ value: gender, label: gender }))}
                        styles={customStyles}
                        placeholder="Select your gender"
                        onChange={(option) => onChange(option?.value)}
                        value={value ? { value, label: value } : null}
                        isSearchable={false}
                      />
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="sports"
                  control={athleteForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>Sports</FormLabel>
                      <Select
                        isMulti
                        isDisabled={!selectedGender}
                        options={availableSports.map(sport => ({
                          value: sport,
                          label: sport
                        }))}
                        styles={customStyles}
                        placeholder="Select your sports..."
                        onChange={(options) => onChange(options?.map(opt => opt.value) || [])}
                        value={value?.map(sport => ({ value: sport, label: sport }))}
                      />
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
                      {!selectedGender && (
                        <FormHelperText>
                          Please select your gender first
                        </FormHelperText>
                      )}
                      <FormHelperText>
                        You can select multiple sports (e.g., Cross Country, Track & Field Indoor, Track & Field Outdoor)
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Button
                  type="submit"
                  colorScheme="pink"
                  bg="brand.accentPrimary"
                  color="white"
                  width="full"
                  size="lg"
                  isLoading={athleteForm.formState.isSubmitting}
                  _hover={{ bg: '#c8aeb0' }}
                >
                  Complete Sign Up
                </Button>
              </VStack>
            </form>
          )}

          <Text color="brand.textSecondary">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="brand.accentPrimary" fontWeight="bold">
              Sign In
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignUp;