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
  Progress,
} from '@chakra-ui/react';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, USER_ROLES } from '../data/formConstants';
import { unformatPhoneNumber } from '../utils/phoneUtils';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

// Import standardized validation system
import { TOAST_MESSAGES } from '../utils/validation/validationMessages';
import { useStandardForm } from '../hooks/useStandardForm';
import { FormField, PhoneField, SchoolField } from '../components/forms';
import { initialSignupSchema, athleteProfileSchema } from '../validation/schemas';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [availableSports, setAvailableSports] = useState([]);
  const [initialData, setInitialData] = useState(null);

  // Form for initial signup using standardized form hook
  const initialForm = useStandardForm({
    schema: initialSignupSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    toastMessages: {
      success: TOAST_MESSAGES.success.accountCreated,
      error: TOAST_MESSAGES.error.signUp,
    }
  });

  // Form for athlete additional info using standardized form hook
  const athleteForm = useStandardForm({
    schema: athleteProfileSchema,
    defaultValues: {
      full_name: '',
      phone: '',
      division: '',
      university: '',
      gender: '',
      sports: [],
    },
    toastMessages: {
      success: TOAST_MESSAGES.success.accountCreated,
      error: TOAST_MESSAGES.error.signUp,
    }
  });

  // Watch form fields for reactive updates
  const selectedDivision = athleteForm.watchField('division');
  const selectedGender = athleteForm.watchField('gender');

  // Handle gender change - update available sports
  useEffect(() => {
    const sports = selectedGender === 'Male' ? MEN_SPORTS :
                  selectedGender === 'Female' ? WOMEN_SPORTS : [];
    setAvailableSports(sports);
    athleteForm.setFormValue('sports', []);
  }, [selectedGender, athleteForm]);

  const handleInitialSubmit = async (data) => {
    setInitialData(data);
    
    if (data.role === 'student-athlete') {
      // Reset athlete form and move to step 2
      athleteForm.reset();
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
      
      navigate('/');
    }
  };

  const handleAthleteSubmit = async (data) => {
    const { error: signUpError } = await signUp(
      initialData.email,
      initialData.password,
      {
        ...data,
        phone: unformatPhoneNumber(data.phone), // Unformat phone for backend
        role: 'student-athlete'
      }
    );

    if (signUpError) throw signUpError;
    
    navigate('/dashboard');
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
            <form onSubmit={initialForm.handleSubmit(handleInitialSubmit)}>
              <VStack spacing={4} width="100%">
                <FormField
                  name="email"
                  control={initialForm.control}
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  isRequired
                  leftIcon={FiMail}
                />

                <FormField
                  name="password"
                  control={initialForm.control}
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  isRequired
                  leftIcon={FiLock}
                />

                <FormField
                  name="confirmPassword"
                  control={initialForm.control}
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  isRequired
                  leftIcon={FiLock}
                />

                <FormField
                  name="role"
                  control={initialForm.control}
                  label="What best describes you?"
                  type="select"
                  placeholder="Select your role"
                  isRequired
                  options={USER_ROLES}
                />

                <Button
                  type="submit"
                  colorScheme="pink"
                  bg="brand.accentPrimary"
                  color="white"
                  width="full"
                  size="lg"
                  isLoading={initialForm.isSubmitting}
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
            <form onSubmit={athleteForm.handleSubmit(handleAthleteSubmit)}>
              <VStack spacing={4} width="100%">
                <FormField
                  name="full_name"
                  control={athleteForm.control}
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  isRequired
                  leftIcon={FiUser}
                />

                <PhoneField
                  name="phone"
                  control={athleteForm.control}
                  label="Phone Number"
                  placeholder="(555) 555-5555"
                  isRequired
                />

                <SchoolField
                  name="division"
                  control={athleteForm.control}
                  label="NCAA Division"
                  placeholder="Select NCAA Division"
                  isRequired
                  fieldType="division"
                />

                <SchoolField
                  name="university"
                  control={athleteForm.control}
                  label="University"
                  placeholder="Select your university"
                  isRequired
                  fieldType="university"
                  selectedDivision={selectedDivision}
                />

                <FormField
                  name="gender"
                  control={athleteForm.control}
                  label="Gender"
                  type="select"
                  placeholder="Select your gender"
                  isRequired
                  options={GENDERS.map(gender => ({ value: gender, label: gender }))}
                />

                <FormField
                  name="sports"
                  control={athleteForm.control}
                  label="Sports"
                  type="react-select"
                  placeholder="Select your sports..."
                  isRequired
                  isMulti
                  options={availableSports.map(sport => ({ value: sport, label: sport }))}
                  helperText={!selectedGender ? "Please select your gender first" : "You can select multiple sports (e.g., Cross Country, Track & Field Indoor, Track & Field Outdoor)"}
                />

                <Button
                  type="submit"
                  colorScheme="pink"
                  bg="brand.accentPrimary"
                  color="white"
                  width="full"
                  size="lg"
                  isLoading={athleteForm.isSubmitting}
                  loadingText="Creating Account..."
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