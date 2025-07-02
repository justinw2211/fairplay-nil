// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  Flex,
  Spinner,
  Text,
  HStack,
  Icon,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Avatar,
  Divider,
  Select as ChakraSelect,
} from '@chakra-ui/react';
import { FiSave, FiX, FiAlertTriangle, FiUser } from 'react-icons/fi';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, NCAA_DIVISIONS } from '../data/formConstants.js';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';

const schema = yup.object().shape({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  division: yup
    .string()
    .required('NCAA Division is required')
    .oneOf(NCAA_DIVISIONS, 'Invalid NCAA Division'),
  university: yup
    .string()
    .required('University is required'),
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(GENDERS, 'Invalid gender selection'),
  sports: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one sport is required')
    .required('At least one sport is required'),
});

const EditProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const isInitialLoad = useRef(true);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: '',
      division: '',
      university: '',
      gender: '',
      sports: [],
    },
    mode: 'onChange',
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');
  const formValues = watch();

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Convert old division format to new format if needed
          const formattedData = {
            ...data,
            division: data.division?.startsWith('D') 
              ? data.division === 'D1' ? 'Division I'
                : data.division === 'D2' ? 'Division II'
                : data.division === 'D3' ? 'Division III'
                : data.division
              : data.division,
            // Handle both string and array sports data
            sports: Array.isArray(data.sports) ? data.sports : data.sports ? [data.sports] : []
          };
          
          // Pre-populate form with existing data
          reset(formattedData);
          
          // Set initial sports list based on gender
          if (data.gender === 'Male') {
            setAvailableSports(MEN_SPORTS);
          } else if (data.gender === 'Female') {
            setAvailableSports(WOMEN_SPORTS);
          }
          
          // Set initial schools list based on division
          if (formattedData.division) {
            const schools = NCAA_SCHOOL_OPTIONS.filter(
              school => school.division === formattedData.division
            );
            setFilteredSchools(schools);
            
            // Validate that the university exists in the filtered schools
            if (formattedData.university) {
              const universityExists = schools.some(
                school => school.name === formattedData.university
              );
              if (!universityExists) {
                // If university doesn't exist in the current division, add it temporarily
                setFilteredSchools([
                  ...schools,
                  { name: formattedData.university, division: formattedData.division }
                ]);
              }
            }
          }
        }
      } catch (error) {
        toast({
          title: 'Error fetching profile',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchProfile();
  }, [user, reset, toast]);

  // Handle division change
  useEffect(() => {
    if (selectedDivision) {
      const schools = NCAA_SCHOOL_OPTIONS.filter(
        school => school.division === selectedDivision
      );
      
      // If we're not in initial load and the university exists
      if (!isInitialLoad.current && formValues.university) {
        const universityExists = schools.some(
          school => school.name === formValues.university
        );
        
        if (!universityExists) {
          // Clear the university if it's not valid for the new division
          setValue('university', '', { shouldValidate: true });
          toast({
            title: 'University Reset',
            description: 'Selected university is not available in the new division.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      setFilteredSchools(schools);
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision, setValue, formValues.university, toast]);

  // Handle gender change
  useEffect(() => {
    const sports = selectedGender === 'Male' ? MEN_SPORTS :
                  selectedGender === 'Female' ? WOMEN_SPORTS : [];
    setAvailableSports(sports);
    
    // Only reset sports if not initial load
    if (!isInitialLoad.current && formValues.sports?.length > 0) {
      const validSports = formValues.sports.filter(sport => sports.includes(sport));
      if (validSports.length !== formValues.sports.length) {
        setValue('sports', validSports, { shouldValidate: true });
        if (validSports.length === 0) {
          toast({
            title: 'Sports Reset',
            description: 'Selected sports are not available for the new gender selection.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  }, [selectedGender, setValue, formValues.sports, toast]);

  // Track form changes
  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const handleCancel = () => {
    if (hasChanges) {
      onOpen();
    } else {
      navigate('/dashboard');
    }
  };

  const handleConfirmCancel = () => {
    onClose();
    navigate('/dashboard');
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated successfully',
        description: 'Your changes have been saved.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setHasChanges(false);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  // Custom styles for react-select
  const customStyles = {
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

  return (
    <Container maxW="container.md" py={12}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" color="brand.textPrimary">
              Edit Profile
            </Heading>
            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={FiX} />}
                variant="outline"
                onClick={handleCancel}
                isDisabled={saving}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<Icon as={FiSave} />}
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                onClick={handleSubmit(onSubmit)}
                isLoading={saving}
                _hover={{ bg: '#c8aeb0' }}
              >
                Save Changes
              </Button>
            </HStack>
          </Flex>

          <Divider />

          {/* Profile Avatar */}
          <Flex justify="center">
            <Avatar
              size="2xl"
              name={formValues.full_name}
              src={user?.avatar_url}
              icon={<Icon as={FiUser} />}
              bg="brand.accentSecondary"
            />
          </Flex>

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.full_name}>
                    <FormLabel>Full Name</FormLabel>
                    <Input {...field} placeholder="Enter your full name" />
                    <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="division"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.division}>
                    <FormLabel>NCAA Division</FormLabel>
                    <ChakraSelect {...field} placeholder="Select NCAA Division">
                      {NCAA_DIVISIONS.map((division) => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </ChakraSelect>
                    <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="university"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.university}>
                    <FormLabel>University</FormLabel>
                    <Select
                      {...field}
                      isDisabled={!selectedDivision}
                      options={filteredSchools.map(school => ({
                        value: school.name,
                        label: school.name
                      }))}
                      placeholder="Search for your university..."
                      styles={customStyles}
                      onChange={(option) => field.onChange(option?.value)}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      isClearable
                    />
                    <FormErrorMessage>{errors.university?.message}</FormErrorMessage>
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
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.gender}>
                    <FormLabel>Gender</FormLabel>
                    <ChakraSelect {...field} placeholder="Select your gender">
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </ChakraSelect>
                    <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="sports"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.sports}>
                    <FormLabel>Sports</FormLabel>
                    <Select
                      {...field}
                      isMulti
                      isDisabled={!selectedGender}
                      options={availableSports.map(sport => ({
                        value: sport,
                        label: sport
                      }))}
                      placeholder="Select your sports..."
                      styles={customStyles}
                      onChange={(options) => field.onChange(options?.map(opt => opt.value) || [])}
                      value={field.value?.map(sport => ({ value: sport, label: sport }))}
                    />
                    <FormErrorMessage>{errors.sports?.message}</FormErrorMessage>
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
            </VStack>
          </form>
        </VStack>
      </Box>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Discard Changes?
            </AlertDialogHeader>

            <AlertDialogBody>
              <HStack spacing={3}>
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} />
                <Text>
                  You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                </Text>
              </HStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Continue Editing
              </Button>
              <Button colorScheme="red" onClick={handleConfirmCancel} ml={3}>
                Discard Changes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default EditProfile;