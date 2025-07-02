// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  useToast,
  Select,
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
} from '@chakra-ui/react';
import { FiSave, FiX, FiAlertTriangle } from 'react-icons/fi';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS } from '../data/formConstants.js';
import { NCAA_SCHOOL_OPTIONS } from '../data/ncaaSchools.js';

const schema = yup.object().shape({
  full_name: yup.string().required('Full name is required'),
  division: yup.string().required('NCAA Division is required'),
  university: yup.string().required('University is required'),
  gender: yup.string().required('Gender is required'),
  sport: yup.string().required('Sport is required'),
});

const EditProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: '',
      division: '',
      university: '',
      gender: '',
      sport: '',
    }
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            reset(data);
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
    }
  }, [user, reset, toast]);

  useEffect(() => {
    if (selectedDivision) {
      setFilteredSchools(NCAA_SCHOOL_OPTIONS.filter(school => school.division === selectedDivision));
      if (!isInitialLoad.current) {
        setValue('university', '');
      }
    } else {
      setFilteredSchools([]);
    }
  }, [selectedDivision, setValue]);

  useEffect(() => {
    if (selectedGender === 'Male') {
      setAvailableSports(MEN_SPORTS);
    } else if (selectedGender === 'Female') {
      setAvailableSports(WOMEN_SPORTS);
    } else {
      setAvailableSports([]);
    }
    if (!isInitialLoad.current) {
      setValue('sport', '');
    }
  }, [selectedGender, setValue]);

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
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
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
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.md" py={12}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" color="brand.textPrimary">
              Edit Profile
            </Heading>
            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={FiX} />}
                variant="ghost"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<Icon as={FiSave} />}
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                onClick={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                _hover={{ bg: '#c8aeb0' }}
              >
                Save Changes
              </Button>
            </HStack>
          </Flex>

          <Text color="gray.600">
            Update your profile information below. All fields are required.
          </Text>

          <VStack spacing={4} as="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.full_name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input {...field} />
                  <FormErrorMessage>{errors.full_name?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.division}>
                  <FormLabel>NCAA Division</FormLabel>
                  <Select {...field} placeholder="Select Division">
                    <option value="D1">Division I</option>
                    <option value="D2">Division II</option>
                    <option value="D3">Division III</option>
                  </Select>
                  <FormErrorMessage>{errors.division?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="university"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.university}>
                  <FormLabel>University</FormLabel>
                  <Select
                    {...field}
                    placeholder="Select University"
                    isDisabled={!selectedDivision}
                  >
                    {filteredSchools.map(school => (
                      <option key={school.value} value={school.value}>
                        {school.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.university?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.gender}>
                  <FormLabel>Gender</FormLabel>
                  <Select {...field} placeholder="Select Gender">
                    {GENDERS.map(g => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                </FormControl>
              )}
            />

            <Controller
              name="sport"
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.sport}>
                  <FormLabel>Sport</FormLabel>
                  <Select
                    {...field}
                    placeholder="Select Sport"
                    isDisabled={!selectedGender}
                  >
                    {availableSports.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </VStack>
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiAlertTriangle} color="orange.500" />
                <Text>Discard Changes?</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Stay
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