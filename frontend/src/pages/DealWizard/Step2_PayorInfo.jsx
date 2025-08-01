// frontend/src/pages/DealWizard/Step2_PayorInfo.jsx
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
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import { createLogger } from '../../utils/logger';

const logger = createLogger('Step2_PayorInfo');

const Step2_PayorInfo = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();

  const [payorType, setPayorType] = useState('');
  const [payorName, setPayorName] = useState('');
  const [payorEmail, setPayorEmail] = useState('');
  const [payorPhone, setPayorPhone] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (currentDeal) {
      setPayorType(currentDeal.payor_type || '');
      setPayorName(currentDeal.payor_name || '');
      setPayorEmail(currentDeal.payor_email || '');
      setPayorPhone(currentDeal.payor_phone || '');

      logger.info('Payor info loaded from deal', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'useEffect',
        hasPayorType: !!currentDeal.payor_type,
        hasPayorName: !!currentDeal.payor_name,
        hasPayorEmail: !!currentDeal.payor_email,
        hasPayorPhone: !!currentDeal.payor_phone
      });
    }
  }, [currentDeal]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setPayorEmail(email);

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      logger.warn('Invalid email format entered', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleEmailChange',
        email: email
      });
    } else {
      setEmailError('');
    }
  };

  const isFormValid = payorType && payorName.trim() &&
                     (!payorEmail.trim() || validateEmail(payorEmail));

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPayorPhone(formatted);
  };

  const handleBack = () => {
    logger.info('User navigated back', {
      dealId,
      dealType,
      step: 'Step2_PayorInfo',
      operation: 'handleBack'
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/terms/${dealId}${typeParam}`);
  };

  const handleNext = async () => {
    if (payorEmail && !validateEmail(payorEmail)) {
      setEmailError('Please enter a valid email address');
      logger.error('Form validation failed - invalid email', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleNext',
        payorEmail: payorEmail,
        payorType: payorType,
        payorName: payorName
      });
      return;
    }

    if (!isFormValid) {
      logger.error('Form validation failed - missing required fields', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleNext',
        hasPayorType: !!payorType,
        hasPayorName: !!payorName.trim(),
        hasValidEmail: !payorEmail.trim() || validateEmail(payorEmail)
      });
      return;
    }

    try {
      await updateDeal(dealId, {
        payor_type: payorType,
        payor_name: payorName,
        payor_email: payorEmail,
        payor_phone: payorPhone,
      });

      logger.info('Payor info updated successfully', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleNext',
        payorType: payorType,
        hasPayorName: !!payorName,
        hasPayorEmail: !!payorEmail,
        hasPayorPhone: !!payorPhone
      });

      // ALL deal types now continue to activities selection (no more skipping)
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
    } catch (error) {
      logger.error('Failed to update payor info', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleNext',
        payorType: payorType,
        hasPayorName: !!payorName,
        hasPayorEmail: !!payorEmail,
        hasPayorPhone: !!payorPhone
      });

      // Re-throw the error to be handled by the ErrorBoundary
      throw error;
    }
  };

  const handleFinishLater = () => {
    logger.info('User chose to finish later', {
      dealId,
      dealType,
      step: 'Step2_PayorInfo',
      operation: 'handleFinishLater'
    });
    navigate('/dashboard');
  };

  // Get progress information - all deal types use same 10-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '3 of 10',
      percentage: 30
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <DealWizardStepWrapper stepNumber={2} stepName="Payor Information">
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
              <Heading size="lg" color="brand.textPrimary">Payor Information</Heading>
              <Text color="brand.textSecondary" fontSize="lg">
                Who is compensating you for this deal? This information is required for valuation and compliance purposes.
              </Text>
            </VStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={8}>
              {/* Radio Button Group */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Is the payor a business or an individual? *
                </FormLabel>
                <RadioGroup value={payorType} onChange={setPayorType}>
                  <Stack spacing={3}>
                    <Radio
                      value="business"
                      borderColor="brand.accentSecondary"
                      _checked={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.accentPrimary",
                      }}
                    >
                      <Text color="brand.textPrimary" fontWeight="medium">Business</Text>
                    </Radio>
                    <Radio
                      value="individual"
                      borderColor="brand.accentSecondary"
                      _checked={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.accentPrimary",
                      }}
                    >
                      <Text color="brand.textPrimary" fontWeight="medium">Individual</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Payor Name Input */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Payor's Full Name or Company Name *
                </FormLabel>
                <Input
                  value={payorName}
                  onChange={(e) => setPayorName(e.target.value)}
                  placeholder={payorType === "business" ? "e.g., Nike Inc." : "e.g., John Smith"}
                  h="12"
                  fontSize="base"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                />
              </FormControl>

              {/* Email Input */}
              <FormControl isInvalid={emailError}>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Payor's Contact Email (optional)
                </FormLabel>
                <Input
                  type="email"
                  value={payorEmail}
                  onChange={handleEmailChange}
                  placeholder="e.g., contact@company.com"
                  h="12"
                  fontSize="base"
                  borderColor={emailError ? "red.500" : "brand.accentSecondary"}
                  _focus={{
                    borderColor: emailError ? "red.500" : "brand.accentPrimary",
                    boxShadow: `0 0 0 1px ${emailError ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-brand-accentPrimary)"}`,
                  }}
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>

              {/* Phone Number Input */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Payor's Phone Number (optional)
                </FormLabel>
                <Input
                  type="tel"
                  value={payorPhone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  h="12"
                  fontSize="base"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                />
              </FormControl>

              {/* Navigation Buttons */}
              <Flex justify="space-between" align="center" pt={8} w="full">
                {/* Finish Later Button */}
                <Button
                  variant="ghost"
                  leftIcon={<Box as={Clock} boxSize={5} />}
                  h="12"
                  px="6"
                  fontSize="base"
                  fontWeight="medium"
                  color="brand.textSecondary"
                  _hover={{ color: "brand.textPrimary" }}
                  onClick={handleFinishLater}
                >
                  Finish Later
                </Button>

                {/* Back/Next Buttons */}
                <Flex gap={4}>
                  <Button
                    variant="outline"
                    leftIcon={<Box as={ChevronLeft} boxSize={5} />}
                    h="12"
                    px="6"
                    fontSize="base"
                    fontWeight="medium"
                    borderColor="brand.accentSecondary"
                    color="brand.textSecondary"
                    _hover={{
                      bg: "brand.accentSecondary",
                      borderColor: "brand.accentPrimary",
                      color: "brand.textPrimary",
                      opacity: 0.1,
                    }}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<Box as={ChevronRight} boxSize={5} />}
                    h="12"
                    px="8"
                    fontSize="base"
                    fontWeight="semibold"
                    bg={isFormValid ? "brand.accentPrimary" : "brand.accentSecondary"}
                    color={isFormValid ? "white" : "brand.textSecondary"}
                    opacity={isFormValid ? 1 : 0.6}
                    _hover={
                      isFormValid
                        ? {
                            transform: "scale(1.05)",
                            bg: "brand.accentPrimary",
                            shadow: "xl",
                          }
                        : {}
                    }
                    _disabled={{
                      cursor: "not-allowed",
                    }}
                    isDisabled={!isFormValid}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step2_PayorInfo;