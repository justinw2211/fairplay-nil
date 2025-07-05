// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ErrorBoundary from '../components/ErrorBoundary';
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
  Badge,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputRightElement,
  Collapse,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiSave, 
  FiX, 
  FiAlertTriangle, 
  FiUser, 
  FiMail, 
  FiPhone,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS, NCAA_DIVISIONS } from '../data/formConstants.js';
import { fetchSchools, FALLBACK_SCHOOLS } from '../data/ncaaSchools';
import { formatPhoneNumber, unformatPhoneNumber, validatePhoneNumber } from '../utils/phoneUtils';
import useSocialMedia from '../hooks/use-social-media';

const schema = yup.object().shape({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .test('phone', 'Phone number must be 10 digits', validatePhoneNumber),
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

const EditProfileContent = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const isInitialLoad = useRef(true);

  // Social media state
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [socialMediaLoading, setSocialMediaLoading] = useState(false);
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(true);
  const { fetchSocialMedia, updateSocialMedia, formatFollowerCount, getPlatformDisplayInfo } = useSocialMedia();

  // Social media platform options
  const socialMediaPlatforms = [
    { value: 'instagram', label: 'Instagram', icon: FiInstagram, color: '#E4405F' },
    { value: 'twitter', label: 'Twitter/X', icon: FiTwitter, color: '#1DA1F2' },
    { value: 'tiktok', label: 'TikTok', icon: FiUsers, color: '#000000' },
    { value: 'youtube', label: 'YouTube', icon: FiYoutube, color: '#FF0000' },
    { value: 'facebook', label: 'Facebook', icon: FiFacebook, color: '#1877F2' },
  ];

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
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
          // Map database enum values to display values
          const mapEnumToDivision = (division) => {
            const enumMap = {
              'I': 'Division I',
              'II': 'Division II',
              'III': 'Division III',
              'NAIA': 'NAIA',
              'JUCO': 'JUCO'
            };
            return enumMap[division] || division;
          };

          // Convert old division format to new format if needed
          const formattedData = {
            ...data,
            division: data.division?.startsWith('D') 
              ? data.division === 'D1' ? 'Division I'
                : data.division === 'D2' ? 'Division II'
                : data.division === 'D3' ? 'Division III'
                : data.division
              : mapEnumToDivision(data.division),
            // Handle both string and array sports data
            sports: Array.isArray(data.sports) ? data.sports : data.sports ? [data.sports] : [],
            // Format phone number if exists
            phone: data.phone ? formatPhoneNumber(data.phone) : '',
            // Set email from user auth data
            email: user.email || ''
          };
          
          // Pre-populate form with existing data
          reset(formattedData);
          
          // Set initial sports list based on gender
          if (data.gender === 'Male') {
            setAvailableSports(MEN_SPORTS);
          } else if (data.gender === 'Female') {
            setAvailableSports(WOMEN_SPORTS);
          }
          
          // Set initial schools list based on division will be handled by the schools useEffect
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

  // Fetch schools when component mounts
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

  // Handle division change
  useEffect(() => {
    if (selectedDivision && schools.length > 0) {
      // Map display division to enum for filtering schools
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

      const enumDivision = mapDivisionToEnum(selectedDivision);
      const filtered = schools.filter(
        school => school.division === enumDivision
      );
      
      // If we're not in initial load and the university exists
      if (!isInitialLoad.current && formValues.university) {
        const universityExists = filtered.some(
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
      
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision, setValue, formValues.university, toast, schools]);

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

  // Load social media data
  useEffect(() => {
    const loadSocialMedia = async () => {
      if (!user) return;
      
      setSocialMediaLoading(true);
      try {
        const data = await fetchSocialMedia();
        setSocialMediaData(data || []);
      } catch (error) {
        console.error('Error loading social media:', error);
        // Don't show error toast for social media, it's not critical
        setSocialMediaData([]);
      } finally {
        setSocialMediaLoading(false);
      }
    };

    loadSocialMedia();
  }, [user, fetchSocialMedia]);

  // Social media management functions
  const addSocialMediaPlatform = () => {
    if (socialMediaData.length >= 5) {
      toast({
        title: 'Maximum platforms reached',
        description: 'You can add up to 5 social media platforms.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const newPlatform = {
      id: Date.now(),
      platform: '',
      handle: '',
      followers: 0,
      verified: false,
      isNew: true,
    };
    setSocialMediaData([...socialMediaData, newPlatform]);
    setHasChanges(true);
  };

  const updateSocialMediaPlatform = (id, field, value) => {
    setSocialMediaData(prev => prev.map(platform => 
      platform.id === id ? { ...platform, [field]: value } : platform
    ));
    setHasChanges(true);
  };

  const removeSocialMediaPlatform = (id) => {
    setSocialMediaData(prev => prev.filter(platform => platform.id !== id));
    setHasChanges(true);
  };

  const saveSocialMedia = async () => {
    try {
      // Validate social media data
      const validPlatforms = socialMediaData.filter(platform => 
        platform.platform && platform.handle
      );

      // Format handles to ensure they start with @
      const formattedPlatforms = validPlatforms.map(platform => ({
        ...platform,
        handle: platform.handle.startsWith('@') ? platform.handle : `@${platform.handle}`,
      }));

      await updateSocialMedia({ platforms: formattedPlatforms });
      
      toast({
        title: 'Social media updated',
        description: 'Your social media information has been saved successfully.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving social media:', error);
      toast({
        title: 'Error saving social media',
        description: error.message || 'Failed to save social media information.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Enhanced save functions to include social media
  const handleSaveAndExit = async () => {
    if (isDirty || hasChanges) {
      setSaving(true);
      try {
        // Save profile data if form is dirty
        if (isDirty) {
          const formData = getValues();
          await onSubmit(formData);
        }
        
        // Save social media data if changed
        if (hasChanges) {
          await saveSocialMedia();
        }
        
        navigate('/dashboard');
      } catch (error) {
        // Error handling already done in individual save functions
      } finally {
        setSaving(false);
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleConfirmDiscard = () => {
    onClose();
    navigate('/dashboard');
  };

  const onSubmit = async (data) => {
    setSaving(true);
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

      // First update profile data without email (since it's managed by auth)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: unformatPhoneNumber(data.phone),
          division: mapDivisionToEnum(data.division),
          university: data.university,
          gender: data.gender,
          sports: data.sports,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Then update email in auth if it changed
      if (data.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({
          email: data.email
        });
        if (updateEmailError) throw updateEmailError;

        toast({
          title: 'Email verification required',
          description: 'Please check your new email for a verification link.',
          status: 'info',
          duration: 7000,
          isClosable: true,
        });
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
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

  // Card colors for social media section
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
                colorScheme="red"
                onClick={onOpen}
                isDisabled={saving}
              >
                Exit
              </Button>
              <Button
                leftIcon={<Icon as={FiSave} />}
                variant="outline"
                onClick={handleSaveAndExit}
                isLoading={saving}
                loadingText="Saving..."
              >
                Save & Exit
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
                render={({ field, fieldState: { error } }) => (
                  <FormControl isInvalid={error}>
                    <FormLabel>Full Name</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiUser} color="gray.300" />
                      </InputLeftElement>
                      <Input {...field} placeholder="Enter your full name" />
                    </InputGroup>
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl isInvalid={error}>
                    <FormLabel>Email Address</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiMail} color="gray.300" />
                      </InputLeftElement>
                      <Input {...field} type="email" placeholder="Enter your email address" />
                    </InputGroup>
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                  <FormControl isInvalid={error}>
                    <FormLabel>Phone Number</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiPhone} color="gray.300" />
                      </InputLeftElement>
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
                    </InputGroup>
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                    <FormHelperText>Format: (XXX) XXX-XXXX</FormHelperText>
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
                    {isLoadingSchools ? (
                      <Flex justify="center" align="center" h="40px">
                        <Spinner />
                      </Flex>
                    ) : (
                      <Select
                        options={filteredSchools.map(school => ({
                          value: school.name,
                          label: school.name
                        }))}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        onChange={(option) => field.onChange(option?.value)}
                        styles={customStyles}
                        placeholder="Select your university"
                        isDisabled={!selectedDivision}
                        isClearable
                      />
                    )}
                    <FormErrorMessage>
                      {errors.university && errors.university.message}
                    </FormErrorMessage>
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

              {/* Social Media Section */}
              <Card borderColor={borderColor} shadow="sm">
                <CardHeader pb={4}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={FiUsers} color="brand.accentPrimary" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Heading size="md" color="brand.textPrimary">
                          Social Media Platforms
                        </Heading>
                        <Text fontSize="sm" color="brand.textSecondary">
                          Manage your social media presence for NIL compliance
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge 
                        colorScheme={socialMediaData.length > 0 ? "green" : "gray"}
                        variant="subtle"
                      >
                        {socialMediaData.length} platform{socialMediaData.length !== 1 ? 's' : ''}
                      </Badge>
                      <IconButton
                        icon={<Icon as={socialMediaExpanded ? FiChevronUp : FiChevronDown} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSocialMediaExpanded(!socialMediaExpanded)}
                        aria-label="Toggle social media section"
                      />
                    </HStack>
                  </Flex>
                </CardHeader>

                <Collapse in={socialMediaExpanded}>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {socialMediaLoading ? (
                        <Flex justify="center" py={8}>
                          <Spinner color="brand.accentPrimary" />
                        </Flex>
                      ) : (
                        <>
                          {socialMediaData.length === 0 ? (
                            <Box
                              textAlign="center"
                              py={8}
                              bg="gray.50"
                              borderRadius="lg"
                              border="2px dashed"
                              borderColor="gray.200"
                            >
                              <Icon as={FiUsers} boxSize={8} color="gray.400" mb={2} />
                              <Text color="gray.500" fontSize="sm">
                                No social media platforms added yet
                              </Text>
                              <Text fontSize="xs" color="gray.400" mt={1}>
                                Add your platforms to enhance your NIL profile
                              </Text>
                            </Box>
                          ) : (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {socialMediaData.map((platform) => {
                                const platformInfo = socialMediaPlatforms.find(p => p.value === platform.platform);
                                const IconComponent = platformInfo?.icon || FiUsers;
                                
                                return (
                                  <Card key={platform.id} size="sm" variant="outline" borderColor={borderColor}>
                                    <CardBody>
                                      <VStack spacing={3}>
                                        <Flex justify="space-between" align="center" w="full">
                                          <HStack spacing={2}>
                                            <Icon 
                                              as={IconComponent} 
                                              color={platformInfo?.color || 'gray.500'} 
                                              boxSize={4}
                                            />
                                            <Text fontSize="sm" fontWeight="medium">
                                              {platformInfo?.label || 'Select Platform'}
                                            </Text>
                                          </HStack>
                                          <IconButton
                                            icon={<Icon as={FiTrash2} />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => removeSocialMediaPlatform(platform.id)}
                                            aria-label="Remove platform"
                                          />
                                        </Flex>

                                        <VStack spacing={2} w="full">
                                          <ChakraSelect
                                            value={platform.platform}
                                            onChange={(e) => updateSocialMediaPlatform(platform.id, 'platform', e.target.value)}
                                            placeholder="Select platform"
                                            size="sm"
                                          >
                                            {socialMediaPlatforms.map((option) => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </ChakraSelect>

                                          <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none">
                                              <Text fontSize="xs" color="gray.400">@</Text>
                                            </InputLeftElement>
                                            <Input
                                              value={platform.handle.replace('@', '')}
                                              onChange={(e) => updateSocialMediaPlatform(platform.id, 'handle', e.target.value)}
                                              placeholder="username"
                                            />
                                          </InputGroup>

                                          <NumberInput
                                            value={platform.followers}
                                            onChange={(value) => updateSocialMediaPlatform(platform.id, 'followers', parseInt(value) || 0)}
                                            min={0}
                                            size="sm"
                                            w="full"
                                          >
                                            <NumberInputField placeholder="Followers" />
                                            <NumberInputStepper>
                                              <NumberIncrementStepper />
                                              <NumberDecrementStepper />
                                            </NumberInputStepper>
                                          </NumberInput>

                                          {platform.followers > 0 && (
                                            <Text fontSize="xs" color="brand.textSecondary" alignSelf="flex-end">
                                              {formatFollowerCount(platform.followers)} followers
                                            </Text>
                                          )}
                                        </VStack>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                );
                              })}
                            </SimpleGrid>
                          )}

                          <Flex justify="space-between" align="center" pt={2}>
                            <Button
                              leftIcon={<Icon as={FiPlus} />}
                              size="sm"
                              variant="outline"
                              colorScheme="pink"
                              borderColor="brand.accentPrimary"
                              color="brand.accentPrimary"
                              onClick={addSocialMediaPlatform}
                              isDisabled={socialMediaData.length >= 5}
                              _hover={{
                                bg: 'brand.accentPrimary',
                                color: 'white',
                              }}
                            >
                              Add Platform
                            </Button>
                            
                            {socialMediaData.length > 0 && hasChanges && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={saveSocialMedia}
                                isLoading={socialMediaLoading}
                              >
                                Save Social Media
                              </Button>
                            )}
                          </Flex>

                          <Text fontSize="xs" color="gray.500" textAlign="center">
                            Social media information is used for NIL compliance and deal valuation.
                            You can add up to 5 platforms.
                          </Text>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Collapse>
              </Card>

              {/* End of form fields */}
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
              Discard Changes & Exit?
            </AlertDialogHeader>

            <AlertDialogBody>
              <HStack spacing={3}>
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} />
                <Text>
                  You have unsaved changes. Are you sure you want to exit without saving? Your changes will be lost.
                </Text>
              </HStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Continue Editing
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDiscard} ml={3}>
                Discard & Exit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

const EditProfile = () => {
  return (
    <ErrorBoundary context="Profile">
      <EditProfileContent />
    </ErrorBoundary>
  );
};

export default EditProfile;