// frontend/src/pages/DealWizard/Step7_DealType.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
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
  FormErrorMessage,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import { createLogger } from '../../utils/logger';

const logger = createLogger('Step7_DealType');

const Step7_DealType = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();

  // Keep undefined until the user explicitly selects a value or a valid saved value exists
  const [submissionType, setSubmissionType] = useState(undefined);
  const [error, setError] = useState('');

  // Intentionally do not hydrate a default selection from saved deal data to avoid implicit defaults
  useEffect(() => {
    try {
      if (currentDeal) {
        logger.info('Deal type step loaded (no preselection)', {
          dealId,
          dealType,
          step: 'Step7_DealType',
          operation: 'useEffect_init',
          hasSubmissionType: !!currentDeal.submission_type,
          savedSubmissionType: currentDeal.submission_type
        });
      }
    } catch (error) {
      logger.error('Error during deal type init', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'useEffect_init',
        currentDealExists: !!currentDeal
      });
    }
  }, [currentDeal]);

  const handleSubmissionTypeChange = async (value) => {
    setSubmissionType(value);
    setError('');

    try {
      // Save immediately on selection
      await updateDeal(dealId, {
        submission_type: value,
      });

      logger.info('Deal type updated immediately', {
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'handleSubmissionTypeChange',
        submissionType: value
      });
    } catch (error) {
      logger.error('Failed to update deal type', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'handleSubmissionTypeChange',
        submissionType: value
      });
      setError('Failed to save selection. Please try again.');
    }
  };

  const isFormValid = Boolean(submissionType);

  const handleBack = () => {
    logger.info('User navigated back', {
      dealId,
      dealType,
      step: 'Step7_DealType',
      operation: 'handleBack'
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/compensation/${dealId}${typeParam}`);
  };

  const handleNext = async () => {
    if (!isFormValid) {
      setError('Please select a deal type to continue.');
      logger.error('Form validation failed - missing deal type', {
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'handleNext',
        hasSubmissionType: !!submissionType
      });
      return;
    }

    try {
      logger.info('Deal type step completed successfully', {
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'handleNext',
        submissionType: submissionType
      });

      // Navigate to review step
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/review/${dealId}${typeParam}`);
    } catch (error) {
      logger.error('Failed to navigate to next step', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step7_DealType',
        operation: 'handleNext',
        submissionType: submissionType
      });

      // Re-throw the error to be handled by the ErrorBoundary
      throw error;
    }
  };

  const handleFinishLater = () => {
    logger.info('User chose to finish later', {
      dealId,
      dealType,
      step: 'Step7_DealType',
      operation: 'handleFinishLater'
    });
    navigate('/dashboard');
  };

  // Get progress information - all deal types use same 10-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '8 of 10',
      percentage: 80
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <DealWizardStepWrapper stepNumber={8} stepName="Deal Type">
      <Container maxW="2xl" py={6}>
        <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
          <CardHeader pb={6}>
            {/* Progress Indicator */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">{progressInfo.stepNumber}</Text>
                <Text color="brand.textSecondary">{progressInfo.percentage}% Complete</Text>
              </Flex>
              <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
                <Box
                  bg="brand.accentPrimary"
                  h="2"
                  w={`${progressInfo.percentage}%`}
                  rounded="full"
                  transition="width 0.5s ease-out"
                />
              </Box>
            </VStack>

            {/* Header */}
            <VStack spacing={3} align="start">
              <Heading size="lg" color="brand.textPrimary">Deal Type Classification</Heading>
              <Text color="brand.textSecondary" fontSize="lg">
                Help us understand the nature of this deal for better analysis and training.
              </Text>
            </VStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={8}>
              {/* Radio Button Group */}
              <FormControl isInvalid={!!error}>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  What best describes this deal? *
                </FormLabel>
                <RadioGroup value={submissionType} onChange={handleSubmissionTypeChange}>
                  <Stack spacing={3}>
                    <Radio
                      value="test_demo"
                      isChecked={submissionType === 'test_demo'}
                      borderColor="brand.accentSecondary"
                      _checked={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.accentPrimary",
                      }}
                    >
                      <Text color="brand.textPrimary" fontWeight="medium">Test/demo response (fictional data)</Text>
                    </Radio>
                    <Radio
                      value="prospective"
                      isChecked={submissionType === 'prospective'}
                      borderColor="brand.accentSecondary"
                      _checked={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.accentPrimary",
                      }}
                    >
                      <Text color="brand.textPrimary" fontWeight="medium">Prospective deal (in negotiation)</Text>
                    </Radio>
                    <Radio
                      value="finalized"
                      isChecked={submissionType === 'finalized'}
                      borderColor="brand.accentSecondary"
                      _checked={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.accentPrimary",
                      }}
                    >
                      <Text color="brand.textPrimary" fontWeight="medium">Confirmed deal</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
            </VStack>

            {/* Navigation */}
            <Flex justify="space-between" align="center" pt={8} w="full">
              <Button
                leftIcon={<Icon as={Clock} w="5" h="5" />}
                variant="ghost"
                h="12"
                px="6"
                fontSize="base"
                fontWeight="medium"
                color="brand.textSecondary"
                onClick={handleFinishLater}
                _hover={{
                  color: "brand.textPrimary"
                }}
              >
                Finish Later
              </Button>

              <Flex gap={4}>
                <Button
                  leftIcon={<Icon as={ChevronLeft} w="5" h="5" />}
                  variant="outline"
                  h="12"
                  px="6"
                  fontSize="base"
                  fontWeight="medium"
                  borderColor="brand.accentSecondary"
                  color="brand.textSecondary"
                  onClick={handleBack}
                  _hover={{
                    bg: "brand.backgroundLight",
                    borderColor: "brand.accentPrimary",
                    color: "brand.textPrimary"
                  }}
                >
                  Back
                </Button>
                <Button
                  rightIcon={<Icon as={ChevronRight} w="5" h="5" />}
                  h="12"
                  px="8"
                  fontSize="base"
                  fontWeight="semibold"
                  bg={isFormValid ? "brand.accentPrimary" : "brand.accentSecondary"}
                  color="white"
                  isDisabled={!isFormValid}
                  onClick={handleNext}
                  transition="all 0.2s"
                  _hover={
                    isFormValid
                      ? {
                          transform: "scale(1.05)",
                          shadow: "xl"
                        }
                      : {}
                  }
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed"
                  }}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step7_DealType; 