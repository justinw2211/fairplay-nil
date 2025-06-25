// frontend/src/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
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
  Flex
} from '@chakra-ui/react';
import { GENDERS, MEN_SPORTS, WOMEN_SPORTS } from '../data/formConstants';
import { ncaaSchools } from '../data/ncaaSchools';

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
  const [loading, setLoading] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedDivision = watch('division');
  const selectedGender = watch('gender');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          reset({
            full_name: data.full_name,
            division: data.division,
            university: data.university,
            gender: data.gender,
            sport: data.sport,
          });
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user, reset]);

  useEffect(() => {
    if (selectedDivision) {
      setFilteredSchools(ncaaSchools[selectedDivision] || []);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedGender === 'Male') {
      setAvailableSports(MEN_SPORTS);
    } else if (selectedGender === 'Female') {
      setAvailableSports(WOMEN_SPORTS);
    } else {
      setAvailableSports([]);
    }
    // Do not reset sport here to allow pre-filled data to persist
  }, [selectedGender]);


  const onSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          division: data.division,
          university: data.university,
          gender: data.gender,
          sport: data.sport,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated.',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed.',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxW="container.md" py={12}>
      <Box bg="brand.background" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} as="form" onSubmit={handleSubmit(onSubmit)}>
          <Heading as="h1" color="brand.textPrimary">Edit Profile</Heading>
          
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
                <Select {...field} placeholder="Select University" isDisabled={!selectedDivision}>
                  {filteredSchools.map(school => (
                    <option key={school} value={school}>{school}</option>
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
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
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
                <Select {...field} placeholder="Select Sport" isDisabled={!selectedGender}>
                  {availableSports.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <FormErrorMessage>{errors.sport?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          <Button
            type="submit"
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            isLoading={isSubmitting}
            width="full"
            _hover={{ bg: '#c8aeb0' }}
          >
            Save Changes
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default EditProfile;