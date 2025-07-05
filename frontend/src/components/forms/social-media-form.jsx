import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
  Text,
  Alert,
  AlertIcon,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';

// Social media platforms configuration
const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
];

// Validation schema following existing patterns
const socialMediaSchema = yup.object().shape({
  platforms: yup.array().of(
    yup.object().shape({
      platform: yup.string().required('Platform is required'),
      handle: yup
        .string()
        .required('Handle is required')
        .matches(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @ and contain only letters, numbers, and underscores'),
      followers: yup
        .number()
        .required('Follower count is required')
        .min(0, 'Follower count cannot be negative')
        .integer('Follower count must be a whole number'),
      verified: yup.boolean(),
    })
  ).min(1, 'At least one social media platform is required'),
});

const SocialMediaForm = ({ 
  initialData = [], 
  onSubmit, 
  isLoading = false
}) => {
  const [error, setError] = useState(null);
  const toast = useToast();

  // CRITICAL: Use react-hook-form with yup validation (cursor rule)
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(socialMediaSchema),
    defaultValues: {
      platforms: initialData.length > 0 ? initialData : [
        { platform: '', handle: '', followers: 0, verified: false }
      ]
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'platforms',
  });

  const watchedPlatforms = watch('platforms');

  // Load initial data when it changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      reset({ platforms: initialData });
    }
  }, [initialData, reset]);

  // CRITICAL: Implement loading and error states (cursor rule)
  const submitForm = async (data) => {
    setError(null);
    try {
      await onSubmit(data);
      toast({
        title: 'Social media saved',
        description: 'Your social media information has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to save social media information. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error saving social media',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addPlatform = () => {
    append({ platform: '', handle: '', followers: 0, verified: false });
  };

  const removePlatform = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Get available platforms (exclude already selected ones)
  const getAvailablePlatforms = (currentIndex) => {
    const selectedPlatforms = watchedPlatforms
      .map((p, index) => index !== currentIndex ? p.platform : null)
      .filter(Boolean);
    
    return SOCIAL_PLATFORMS.filter(platform => 
      !selectedPlatforms.includes(platform.value)
    );
  };

  const formatFollowerCount = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Box>
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <form id="social-media-form" onSubmit={handleSubmit(submitForm)}>
        <VStack spacing={6}>
          <Box w="full">
            <HStack justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold" color="brand.textPrimary">
                Social Media Platforms
              </Text>
              <Tooltip label="Add your social media accounts to help brands find you for NIL deals">
                <InfoIcon color="brand.textSecondary" />
              </Tooltip>
            </HStack>

            <VStack spacing={4}>
              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  w="full"
                  p={4}
                  borderWidth="1px"
                  borderColor="brand.accentSecondary"
                  borderRadius="lg"
                  bg="white"
                >
                  <Flex justify="space-between" align="flex-start">
                    <VStack spacing={4} flex={1} mr={4}>
                      {/* Platform Selection */}
                      <FormControl isInvalid={errors.platforms?.[index]?.platform}>
                        <FormLabel fontWeight="semibold" color="brand.textPrimary">
                          Platform
                        </FormLabel>
                        <Controller
                          name={`platforms.${index}.platform`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              placeholder="Select platform"
                              borderColor="brand.accentSecondary"
                              _focus={{
                                borderColor: "brand.accentPrimary",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                              }}
                            >
                              {getAvailablePlatforms(index).map((platform) => (
                                <option key={platform.value} value={platform.value}>
                                  {platform.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        />
                        <FormErrorMessage>
                          {errors.platforms?.[index]?.platform?.message}
                        </FormErrorMessage>
                      </FormControl>

                      {/* Handle Input */}
                      <FormControl isInvalid={errors.platforms?.[index]?.handle}>
                        <FormLabel fontWeight="semibold" color="brand.textPrimary">
                          Handle
                        </FormLabel>
                        <Controller
                          name={`platforms.${index}.handle`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="@username"
                              borderColor="brand.accentSecondary"
                              _focus={{
                                borderColor: "brand.accentPrimary",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                              }}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value && !value.startsWith('@')) {
                                  value = '@' + value;
                                }
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        <FormErrorMessage>
                          {errors.platforms?.[index]?.handle?.message}
                        </FormErrorMessage>
                      </FormControl>

                      {/* Follower Count */}
                      <FormControl isInvalid={errors.platforms?.[index]?.followers}>
                        <FormLabel fontWeight="semibold" color="brand.textPrimary">
                          Followers/Subscribers
                        </FormLabel>
                        <Controller
                          name={`platforms.${index}.followers`}
                          control={control}
                          render={({ field }) => (
                            <NumberInput
                              {...field}
                              min={0}
                              borderColor="brand.accentSecondary"
                              _focus={{
                                borderColor: "brand.accentPrimary",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                              }}
                              onChange={(value) => field.onChange(parseInt(value) || 0)}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          )}
                        />
                        {watchedPlatforms[index]?.followers > 0 && (
                          <Text fontSize="sm" color="brand.textSecondary" mt={1}>
                            {formatFollowerCount(watchedPlatforms[index].followers)} followers
                          </Text>
                        )}
                        <FormErrorMessage>
                          {errors.platforms?.[index]?.followers?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </VStack>

                    {/* Remove Button */}
                    {fields.length > 1 && (
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlatform(index)}
                        aria-label="Remove platform"
                        isDisabled={isLoading}
                      />
                    )}
                  </Flex>
                </Box>
              ))}
            </VStack>

            {/* Add Platform Button */}
            {fields.length < SOCIAL_PLATFORMS.length && (
              <Button
                leftIcon={<AddIcon />}
                variant="outline"
                onClick={addPlatform}
                mt={4}
                borderColor="brand.accentPrimary"
                color="brand.accentPrimary"
                _hover={{
                  bg: "brand.accentPrimary",
                  color: "white",
                }}
                isDisabled={isLoading}
              >
                Add Another Platform
              </Button>
            )}
          </Box>
          
          {/* Hidden submit button for external triggers */}
          <Button
            type="submit"
            data-testid="social-media-submit"
            style={{ display: 'none' }}
            isLoading={isLoading}
          >
            Submit
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default SocialMediaForm; 