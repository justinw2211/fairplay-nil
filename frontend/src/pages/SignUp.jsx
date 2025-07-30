// frontend/src/pages/SignUp.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
  FormHelperText,
} from '@chakra-ui/react';

import { useForm, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, NCAA_DIVISIONS } from '../data/formConstants';
import { fetchSchools, FALLBACK_SCHOOLS } from '../data/ncaaSchools';
import { formatPhoneNumber, unformatPhoneNumber, validatePhoneNumber } from '../utils/phoneUtils';

const USER_ROLES = [
  { value: 'student-athlete', label: 'Student-Athlete' },
  { value: 'agent', label: 'Agent' },
  { value: 'coach', label: 'Coach' },
  { value: 'university', label: 'University' },
  { value: 'collective', label: 'Collective' },
  { value: 'brand', label: 'Brand' },
  { value: 'other', label: 'Other' }
];

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [initialData, setInitialData] = useState(null);
  const [availableSports, setAvailableSports] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  


  // Step 1 form
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    watch: watch1,
  } = useForm();

  // Step 2 form
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    watch: watch2,
    setValue: setValue2,
  } = useForm();

  const watchedPassword = watch1('password');
  const selectedGender = watch2('gender');
  const selectedDivision = watch2('division');

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const schoolsData = await fetchSchools();
        setSchools(schoolsData.length > 0 ? schoolsData : FALLBACK_SCHOOLS);
      } catch (error) {
        console.error('Error loading schools:', error);
        setSchools(FALLBACK_SCHOOLS);
        toast({
          title: 'Warning',
          description: 'Could not load schools list. Using fallback data.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingSchools(false);
      }
    };
    loadSchools();
  }, [toast]);

  // Filter schools when division changes
  useEffect(() => {
    if (selectedDivision && schools.length > 0) {
      const filtered = schools.filter(
        school => school.division === selectedDivision
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision, schools]);

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

  // Custom styles for react-select (matching EditProfile)
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3182ce' : '#E2E8F0',
      boxShadow: state.isFocused ? '0 0 0 1px #3182ce' : 'none',
      '&:hover': {
        borderColor: '#3182ce',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3182ce' : state.isFocused ? '#EDF2F7' : 'white',
      color: state.isSelected ? 'white' : '#1A202C',
    }),
  };

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
      // Map display division values to database enum values
      const mapDivisionToEnum = (division) => {
        const divisionMap = {
          'Division I': 'I',
          'Division II': 'II',
          'Division III': 'III',
          'NAIA': 'NAIA',
          'JUCO': 'JUCO'
        };
        return divisionMap[division] || division;
      };

      const { data: signUpData, error } = await signUp(initialData.email, initialData.password, {
        role: 'student-athlete',
        full_name: data.full_name,
        phone: unformatPhoneNumber(data.phone), // Unformat phone for backend
        division: mapDivisionToEnum(data.division), // Map display to enum value
        university: data.university,
        expected_graduation_year: data.expected_graduation_year,
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



      // Save profile data directly to profiles table since trigger isn't working
      if (signUpData?.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: signUpData.user.id,
              full_name: data.full_name,
              role: 'athlete',
              phone: unformatPhoneNumber(data.phone),
              division: mapDivisionToEnum(data.division),
              university: data.university,
              gender: data.gender,
              sports: data.sports,
              expected_graduation_year: data.expected_graduation_year,
            });

          if (profileError) {
            console.error('Profile save error:', profileError);
            // Don't fail signup if profile save fails
          }
        } catch (profileError) {
          console.error('Profile save error:', profileError);
          // Don't fail signup if profile save fails
        }
      }

      // Sign in the user immediately after signup
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: initialData.email,
          password: initialData.password,
        });

        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          // Don't fail signup if auto sign-in fails
        } else {
          console.log('Auto sign-in successful');
        }
      } catch (signInError) {
        console.error('Auto sign-in error:', signInError);
        // Don't fail signup if auto sign-in fails
      }

      console.log('Signup successful, navigating to dashboard');
      
      toast({
        title: 'Account Created!',
        description: 'Welcome to FairPlay NIL',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to dashboard immediately - the dashboard will handle showing the social media modal
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
    <>
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
                <Controller
                  name="full_name"
                  control={control2}
                  rules={{
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>Full Name</FormLabel>
                                        <Input
                    {...field}
                    placeholder="Enter your full name"
                  />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="phone"
                  control={control2}
                  rules={{
                    required: 'Phone number is required',
                    validate: (value) => {
                      if (!validatePhoneNumber(value)) {
                        return 'Phone number must be 10 digits';
                      }
                      return true;
                    },
                  }}
                  render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        {...field}
                        value={value || ''}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          if (formatted !== undefined) {
                            onChange(formatted);
                          }
                        }}
                        placeholder="(555) 555-5555"
                        maxLength={14}
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                      <FormHelperText>Format: (XXX) XXX-XXXX</FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name="division"
                  control={control2}
                  rules={{
                    required: 'Please select your NCAA Division',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>NCAA Division</FormLabel>
                      <Select
                        {...field}
                        placeholder="Select NCAA Division"
                      >
                        {NCAA_DIVISIONS.map((division) => (
                          <option key={division} value={division}>
                            {division}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="university"
                  control={control2}
                  rules={{
                    required: 'University is required',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>University</FormLabel>
                      <ReactSelect
                        options={filteredSchools.map(school => ({
                          value: school.name,
                          label: school.name
                        }))}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        onChange={(option) => field.onChange(option?.value || '')}
                        styles={customSelectStyles}
                        placeholder="Select your university"
                        isDisabled={!selectedDivision}
                        isClearable
                        isSearchable
                        isLoading={isLoadingSchools}
                        noOptionsMessage={() => 
                          !selectedDivision 
                            ? 'Please select a division first'
                            : 'No universities found'
                        }
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                      {!selectedDivision && (
                        <FormHelperText>
                          Please select your NCAA Division first
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="expected_graduation_year"
                  control={control2}
                  rules={{
                    required: 'Graduation year is required',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>Expected Graduation Year</FormLabel>
                      <Select
                        {...field}
                        placeholder="Select graduation year"
                      >
                        {Array.from({length: 11}, (_, i) => 2025 + i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="gender"
                  control={control2}
                  rules={{
                    required: 'Please select your gender',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        {...field}
                        placeholder="Select your gender"
                      >
                        {GENDERS.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />

                <Controller
                  name="sports"
                  control={control2}
                  rules={{
                    required: 'Please select at least one sport',
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return 'Please select at least one sport';
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl isInvalid={!!error}>
                      <FormLabel>Sports</FormLabel>
                      <ReactSelect
                        {...field}
                        options={availableSports}
                        isMulti
                        placeholder="Select your sports..."
                        styles={customSelectStyles}
                        onChange={(selectedOptions) => {
                          field.onChange(selectedOptions ? selectedOptions.map(opt => opt.value) : []);
                        }}
                        value={field.value?.map(sport => ({ value: sport, label: sport })) || []}
                        isDisabled={!selectedGender}
                        noOptionsMessage={() => 
                          !selectedGender 
                            ? 'Please select your gender first'
                            : 'No sports found'
                        }
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                      {!selectedGender ? (
                        <FormHelperText>
                          Please select your gender first
                        </FormHelperText>
                      ) : (
                        <FormHelperText>
                          You can select multiple sports (e.g., Cross Country, Track & Field)
                        </FormHelperText>
                      )}
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
    </>
  );
};

export default SignUp;