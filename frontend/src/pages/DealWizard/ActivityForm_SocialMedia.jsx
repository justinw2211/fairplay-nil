// frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';

// Validation schema for a single platform entry
const platformSchema = yup.object().shape({
  platform: yup.string().required('Platform is required.'),
  quantity: yup.number().typeError('Must be a number').min(1, 'Quantity must be at least 1').required('Quantity is required.'),
});

// Main schema for the social media form
const schema = yup.object().shape({
  platforms: yup.array().of(platformSchema).min(1, 'Please add at least one social media deliverable.'),
});

const ActivityForm_SocialMedia = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { platforms: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "platforms",
  });

  useEffect(() => {
    if (deal?.obligations?.['Social Media']) {
      reset({ platforms: deal.obligations['Social Media'] });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    const newObligations = { ...deal.obligations, "Social Media": formData.platforms };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
  };

  const handleBack = () => {
    navigate(`/add/deal/activities/select/${dealId}`);
  };

  const handleFinishLater = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxW="2xl" py={6}>
      <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
        <CardHeader pb={6}>
          {/* Progress Indicator */}
          <VStack spacing={3} mb={6}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="medium">Step 4 of 8</Text>
              <Text color="brand.textSecondary">50% Complete</Text>
            </Flex>
            <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
              <Box
                bg="brand.accentPrimary"
                h="2"
                w="50%"
                rounded="full"
                transition="width 0.5s ease-out"
              />
            </Box>
          </VStack>

          {/* Header */}
          <VStack spacing={3} align="start">
            <Heading size="lg" color="brand.textPrimary">Social Media Details</Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Specify the social media posts you'll create as part of this deal.
            </Text>
          </VStack>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={8} as="form" onSubmit={handleSubmit(onContinue)}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                w="full"
                p={6}
                bg="brand.backgroundLight"
                rounded="lg"
                border="1px"
                borderColor="brand.accentSecondary"
              >
                <VStack spacing={4}>
                  <Flex w="full" justify="space-between" align="center">
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Social Media Post {index + 1}
                    </Text>
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => remove(index)}
                      aria-label="Remove platform"
                    />
                  </Flex>
                  <FormControl>
                    <FormLabel color="brand.textPrimary">Platform</FormLabel>
                    <Controller
                      name={`platforms.${index}.platform`}
                      control={control}
                      render={({ field }) => (
                        <Select {...field} bg="white">
                          <option value="">Select Platform</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Twitter">Twitter</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Facebook">Facebook</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="YouTube">YouTube</option>
                        </Select>
                      )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="brand.textPrimary">Number of Posts</FormLabel>
                    <Controller
                      name={`platforms.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} type="number" min="1" bg="white" />
                      )}
                    />
                  </FormControl>
                </VStack>
              </Box>
            ))}

            <Button
              leftIcon={<AddIcon />}
              variant="outline"
              w="full"
              h={12}
              borderColor="brand.accentSecondary"
              color="brand.textSecondary"
              onClick={() => append({ platform: '', quantity: 1 })}
              _hover={{
                bg: "brand.backgroundLight",
                borderColor: "brand.accentPrimary",
                color: "brand.textPrimary",
              }}
            >
              Add Another Platform
            </Button>

            {/* Navigation Buttons */}
            <Flex justify="space-between" pt={8} w="full">
              <Button
                leftIcon={<Icon as={Clock} />}
                variant="ghost"
                color="brand.textSecondary"
                px={8}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="semibold"
                onClick={handleFinishLater}
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Finish Later
              </Button>

              <Flex gap={4}>
                <Button
                  leftIcon={<Icon as={ChevronLeft} />}
                  variant="outline"
                  px={6}
                  py={3}
                  h={12}
                  fontSize="base"
                  fontWeight="semibold"
                  borderColor="brand.accentSecondary"
                  color="brand.textSecondary"
                  onClick={handleBack}
                  _hover={{
                    bg: "brand.backgroundLight",
                    borderColor: "brand.accentPrimary",
                    color: "brand.textPrimary",
                  }}
                >
                  Back
                </Button>
                <Button
                  rightIcon={<Icon as={ChevronRight} />}
                  bg={isValid ? "brand.accentPrimary" : "brand.accentSecondary"}
                  color="white"
                  px={8}
                  py={3}
                  h={12}
                  fontSize="base"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  _hover={
                    isValid
                      ? {
                          transform: "scale(1.05)",
                          bg: "brand.accentPrimary",
                          shadow: "xl",
                        }
                      : {}
                  }
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                  isDisabled={!isValid}
                  type="submit"
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ActivityForm_SocialMedia;