// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
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
  HStack,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, NCAA_DIVISIONS, USER_ROLES } from '../data/formConstants';
import { formatPhoneNumber, unformatPhoneNumber } from '../utils/phoneUtils';
// Testing imports one by one
import { TOAST_MESSAGES } from '../utils/validation/validationMessages';
// import { useStandardForm } from '../hooks/useStandardForm';
// import FormField from '../components/forms/FormField';
// import PhoneField from '../components/forms/PhoneField';
// import SchoolField from '../components/forms/SchoolField';
// import { initialSignupSchema, athleteProfileSchema } from '../validation/schemas';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [availableSports, setAvailableSports] = useState([]);
  const [initialData, setInitialData] = useState(null);

  // Temporarily disable the new forms to test basic rendering
  const [testMode, setTestMode] = useState(true);

  // Form for initial signup using standardized form hook
  // const initialForm = useStandardForm({
  //   schema: initialSignupSchema,
  //   defaultValues: {
  //     email: '',
  //     password: '',
  //     confirmPassword: '',
  //     role: '',
  //   },
  //   toastMessages: {
  //     success: TOAST_MESSAGES.success.accountCreated,
  //     error: TOAST_MESSAGES.error.signUp,
  //   }
  // });

  // Form for athlete additional info using standardized form hook
  // const athleteForm = useStandardForm({
  //   schema: athleteProfileSchema,
  //   defaultValues: {
  //     full_name: '',
  //     phone: '',
  //     division: '',
  //     university: '',
  //     gender: '',
  //     sports: [],
  //   },
  //   toastMessages: {
  //     success: TOAST_MESSAGES.success.accountCreated,
  //     error: TOAST_MESSAGES.error.signUp,
  //   }
  // });

  // Watch form fields for reactive updates
  // const selectedDivision = athleteForm.watchField('division');
  // const selectedGender = athleteForm.watchField('gender');

  // Handle gender change
  // useEffect(() => {
  //   const sports = selectedGender === 'Male' ? MEN_SPORTS :
  //                 selectedGender === 'Female' ? WOMEN_SPORTS : [];
  //   setAvailableSports(sports);
  //   athleteForm.setFormValue('sports', []);
  // }, [selectedGender, athleteForm]);

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

          {testMode ? (
            <VStack spacing={4} width="100%">
              <Text color="brand.textPrimary">
                🧪 Testing Mode - Basic SignUp component is working!
              </Text>
              <Text color="brand.textSecondary" fontSize="sm">
                Currently testing: TOAST_MESSAGES import
                {TOAST_MESSAGES && ` ✅ TOAST_MESSAGES loaded successfully!`}
              </Text>
              <Button
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                width="full"
                size="lg"
                onClick={() => setTestMode(false)}
                _hover={{ bg: '#c8aeb0' }}
              >
                Test Next Import
              </Button>
            </VStack>
          ) : step === 1 ? (
            <VStack spacing={4} width="100%">
              <Text color="green.500">
                ✅ TOAST_MESSAGES import working!
              </Text>
              <Text color="brand.textSecondary" fontSize="sm">
                Testing next: validation schemas...
              </Text>
              <Button onClick={() => setTestMode(true)}>Back to Test Mode</Button>
            </VStack>
          ) : (
            <form 
              key="athlete-form" // Force new instance of form
              onSubmit={athleteForm.handleSubmit(handleAthleteSubmit)} 
              style={{ width: '100%' }}
            >
              <VStack spacing={4}>
                <Controller
                  name="full_name"
                  control={athleteForm.control}
                  render={({ field: { onChange, value, name }, fieldState: { error } }) => {
                    console.log(`Rendering ${name} field:`, { value, error });
                    return (
                      <FormControl isInvalid={error}>
                        <FormLabel>Full Name</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiUser} color="gray.300" />
                          </InputLeftElement>
                          <Input
                            name={name}
                            value={value || ''}
                            onChange={(e) => {
                              console.log(`${name} onChange:`, e.target.value);
                              onChange(e);
                            }}
                            placeholder="Enter your full name"
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {error?.message}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                />

                <Controller
                  name="phone"
                  control={athleteForm.control}
                  render={({ field: { onChange, value, name }, fieldState: { error } }) => {
                    console.log(`Rendering ${name} field:`, { value, error });
                    return (
                      <FormControl isInvalid={error}>
                        <FormLabel>Phone Number</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiPhone} color="gray.300" />
                          </InputLeftElement>
                          <Input
                            name={name}
                            value={value || ''}
                            onChange={(e) => {
                              console.log(`${name} onChange:`, e.target.value);
                              const formatted = formatPhoneNumber(e.target.value);
                              if (formatted !== undefined) {
                                onChange(formatted);
                              }
                            }}
                            type="tel"
                            placeholder="(555) 555-5555"
                            maxLength={14}
                          />
                        </InputGroup>
                        <FormErrorMessage>
                          {error?.message}
                        </FormErrorMessage>
                        <FormHelperText>Format: (XXX) XXX-XXXX</FormHelperText>
                      </FormControl>
                    );
                  }}
                />

                <Controller
                  name="division"
                  control={athleteForm.control}
                  render={({ field: { onChange, value, name }, fieldState: { error } }) => {
                    console.log(`Rendering ${name} field:`, { value, error });
                    return (
                      <FormControl isInvalid={error}>
                        <FormLabel>NCAA Division</FormLabel>
                        <Select
                          inputId={name}
                          options={NCAA_DIVISIONS.map(div => ({ value: div, label: div }))}
                          styles={customStyles}
                          placeholder="Select NCAA Division"
                          onChange={(option) => {
                            console.log(`${name} onChange:`, option);
                            onChange(option?.value);
                          }}
                          value={value ? { value, label: value } : null}
                          isSearchable={false}
                          isClearable={false}
                        />
                        <FormErrorMessage>
                          {error?.message}
                        </FormErrorMessage>
                      </FormControl>
                    );
                  }}
                />

                <Controller
                  name="university"
                  control={athleteForm.control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl isInvalid={error}>
                      <FormLabel>University</FormLabel>
                      {isLoadingSchools ? (
                        <Flex justify="center" align="center" h="40px">
                          <Spinner />
                        </Flex>
                      ) : (
                        <Select
                          name="university"
                          options={filteredSchools.map(school => ({
                            value: school.name,
                            label: school.name
                          }))}
                          onChange={(option) => onChange(option.value)}
                          styles={customStyles}
                          placeholder="Select your university"
                          isDisabled={!selectedDivision}
                        />
                      )}
                      <FormErrorMessage>
                        {error?.message}
                      </FormErrorMessage>
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
                        isClearable={false}
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
                        value={(value || []).map(sport => ({ value: sport, label: sport }))}
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