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
  HStack,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  IconButton,
  InputGroup,
  InputLeftElement,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock, Search } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import { createLogger } from '../../utils/logger';
import { COMPANY_SIZE_OPTIONS } from '../../data/companySizes';
import { INDUSTRY_OPTIONS, getFilteredIndustries } from '../../data/industries';

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
  
  // Company type state variables
  const [companySize, setCompanySize] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industrySearch, setIndustrySearch] = useState('');
  const [otherIndustryText, setOtherIndustryText] = useState('');
  const [companyTypeErrors, setCompanyTypeErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (currentDeal) {
      setPayorType(currentDeal.payor_type || '');
      setPayorName(currentDeal.payor_name || '');
      setPayorEmail(currentDeal.payor_email || '');
      setPayorPhone(currentDeal.payor_phone || '');
      setCompanySize(currentDeal.payor_company_size || '');
      // Map persisted industries back to UI selections, handling "Other: text"
      const restored = Array.isArray(currentDeal.payor_industries)
        ? [...currentDeal.payor_industries]
        : [];
      const otherEntry = restored.find((i) => typeof i === 'string' && i.toLowerCase().startsWith('other:'));
      if (otherEntry) {
        // Extract the free text after 'Other:'
        const text = otherEntry.split(':').slice(1).join(':').trim();
        setOtherIndustryText(text);
        // Replace with the selectable 'Other' token for the checkbox group
        const mapped = restored.filter((i) => i !== otherEntry);
        if (!mapped.includes('Other')) mapped.push('Other');
        setSelectedIndustries(mapped);
      } else {
        setSelectedIndustries(restored);
      }

      logger.info('Payor info loaded from deal', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'useEffect',
        hasPayorType: !!currentDeal.payor_type,
        hasPayorName: !!currentDeal.payor_name,
        hasPayorEmail: !!currentDeal.payor_email,
        hasPayorPhone: !!currentDeal.payor_phone,
        hasCompanySize: !!currentDeal.payor_company_size,
        industriesCount: currentDeal.payor_industries?.length || 0
      });
    }
  }, [currentDeal]);

  // Debounced autosave for company size and industries
  useEffect(() => {
    if (!dealId) return;
    // Require company size and at least one industry before autosaving
    if (!companySize || !Array.isArray(selectedIndustries) || selectedIndustries.length === 0) {
      return;
    }

    // Build industries submission (respect Other + text)
    let industriesToSubmit = [...selectedIndustries];
    if (industriesToSubmit.includes('Other') && otherIndustryText.trim()) {
      industriesToSubmit = industriesToSubmit.filter(i => i !== 'Other');
      industriesToSubmit.push(`Other: ${otherIndustryText.trim()}`);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await updateDeal(dealId, {
          payor_company_size: companySize,
          payor_industries: industriesToSubmit,
        });
        logger.info('Autosaved company info', {
          dealId,
          step: 'Step2_PayorInfo',
          operation: 'autosaveCompanyInfo',
          companySize,
          industriesCount: industriesToSubmit.length
        });
      } catch (e) {
        logger.error('Failed to autosave company info', { error: e?.message, dealId });
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [dealId, companySize, selectedIndustries, otherIndustryText, updateDeal]);

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
                     (!payorEmail.trim() || validateEmail(payorEmail)) &&
                     companySize && selectedIndustries.length > 0 &&
                     (!selectedIndustries.includes('Other') || otherIndustryText.trim());

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPayorPhone(formatted);
  };

  // Company type validation and handlers
  const validateCompanyType = () => {
    const errors = {};
    
    if (!companySize) {
      errors.companySize = 'Please select a company size';
    }
    
    if (selectedIndustries.length === 0) {
      errors.industries = 'Please select at least one industry';
    }
    
    if (selectedIndustries.includes('Other') && !otherIndustryText.trim()) {
      errors.otherIndustry = 'Please specify what "Other" means';
    }
    
    setCompanyTypeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIndustryChange = (industries) => {
    setSelectedIndustries(industries);
    setCompanyTypeErrors({...companyTypeErrors, industries: ''});
    
    // Clear other industry text if "Other" is deselected
    if (!industries.includes('Other')) {
      setOtherIndustryText('');
      setCompanyTypeErrors({...companyTypeErrors, otherIndustry: ''});
    }
  };

  const handleCompanySizeChange = (size) => {
    setCompanySize(size);
    setCompanyTypeErrors({...companyTypeErrors, companySize: ''});
  };

  const handleOtherIndustryChange = (e) => {
    setOtherIndustryText(e.target.value);
    setCompanyTypeErrors({...companyTypeErrors, otherIndustry: ''});
  };

  const getFilteredIndustriesForDisplay = () => {
    return getFilteredIndustries(industrySearch);
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

    // Validate company type when proceeding to next step
    if (!validateCompanyType()) {
      const errorMessages = Object.values(companyTypeErrors).filter(Boolean);
      if (errorMessages.length > 0) {
        toast({
          title: 'Company information required',
          description: errorMessages[0],
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
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
        hasValidEmail: !payorEmail.trim() || validateEmail(payorEmail),
        hasCompanySize: !!companySize,
        industriesCount: selectedIndustries.length
      });
      return;
    }

    try {
      // Prepare industries array, replacing "Other" with custom text if provided
      let industriesToSubmit = [...selectedIndustries];
      if (selectedIndustries.includes('Other') && otherIndustryText.trim()) {
        industriesToSubmit = industriesToSubmit.filter(industry => industry !== 'Other');
        industriesToSubmit.push(`Other: ${otherIndustryText.trim()}`);
      }

      await updateDeal(dealId, {
        payor_type: payorType,
        payor_name: payorName,
        payor_email: payorEmail,
        payor_phone: payorPhone,
        payor_company_size: companySize,
        payor_industries: industriesToSubmit,
      });

      logger.info('Payor info updated successfully', {
        dealId,
        dealType,
        step: 'Step2_PayorInfo',
        operation: 'handleNext',
        payorType: payorType,
        hasPayorName: !!payorName,
        hasPayorEmail: !!payorEmail,
        hasPayorPhone: !!payorPhone,
        companySize: companySize,
        industriesCount: industriesToSubmit.length,
        industries: industriesToSubmit
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

              {/* Company Size Selection */}
              <FormControl isInvalid={companyTypeErrors.companySize}>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Company Size *
                </FormLabel>
                <Text color="brand.textSecondary" fontSize="sm" mb={4}>
                  Help us understand the size of the paying entity
                </Text>
                <RadioGroup value={companySize} onChange={handleCompanySizeChange}>
                  <VStack spacing={3} align="stretch">
                    {COMPANY_SIZE_OPTIONS.map((option) => (
                      <Box
                        key={option.value}
                        p={4}
                        border="1px solid"
                        borderColor={companySize === option.value ? "brand.accentPrimary" : "brand.accentSecondary"}
                        borderRadius="md"
                        bg={companySize === option.value ? "brand.backgroundLight" : "transparent"}
                        cursor="pointer"
                        _hover={{ borderColor: "brand.accentPrimary", bg: "brand.backgroundLight" }}
                        onClick={() => handleCompanySizeChange(option.value)}
                      >
                        <Radio value={option.value} colorScheme="blue">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="brand.textPrimary">
                              {option.label}
                            </Text>
                            <Text fontSize="sm" color="brand.textSecondary">
                              {option.description}
                            </Text>
                            <Text fontSize="xs" color="brand.textSecondary" fontStyle="italic">
                              Examples: {option.example}
                            </Text>
                          </VStack>
                        </Radio>
                      </Box>
                    ))}
                  </VStack>
                </RadioGroup>
                <FormErrorMessage>{companyTypeErrors.companySize}</FormErrorMessage>
              </FormControl>

              {/* Industry Selection */}
              <FormControl isInvalid={companyTypeErrors.industries}>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Industries *
                </FormLabel>
                <Text color="brand.textSecondary" fontSize="sm" mb={4}>
                  Select all industries that apply to this company (you can select multiple)
                </Text>
                
                {/* Industry Search */}
                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color="brand.textSecondary" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search industries..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    borderColor="brand.accentSecondary"
                    _focus={{
                      borderColor: "brand.accentPrimary",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                    }}
                  />
                </InputGroup>

                {/* Industry Checkboxes */}
                <Box
                  maxH="300px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="brand.accentSecondary"
                  borderRadius="md"
                  p={4}
                >
                  <CheckboxGroup value={selectedIndustries} onChange={handleIndustryChange}>
                    <SimpleGrid columns={2} spacing={2}>
                      {getFilteredIndustriesForDisplay().map((industry) => (
                        <Checkbox
                          key={industry}
                          value={industry}
                          colorScheme="blue"
                          size="sm"
                        >
                          <Text fontSize="sm" color="brand.textPrimary">
                            {industry}
                          </Text>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </Box>

                {/* Selected Industries Display */}
                {selectedIndustries.length > 0 && (
                  <Box mt={3} p={3} bg="brand.backgroundLight" borderRadius="md">
                    <Text fontSize="sm" fontWeight="semibold" color="brand.textPrimary" mb={2}>
                      Selected Industries ({selectedIndustries.length}):
                    </Text>
                    <HStack wrap="wrap" spacing={2}>
                      {selectedIndustries.map((industry) => (
                        <Box
                          key={industry}
                          px={2}
                          py={1}
                          bg="brand.accentPrimary"
                          color="white"
                          borderRadius="sm"
                          fontSize="xs"
                        >
                          {industry}
                        </Box>
                      ))}
                    </HStack>
                  </Box>
                )}

                {/* Other Industry Text Input */}
                {selectedIndustries.includes('Other') && (
                  <Box mt={3}>
                    <FormControl isInvalid={companyTypeErrors.otherIndustry}>
                      <FormLabel fontSize="sm" color="brand.textPrimary">
                        Please specify what "Other" means:
                      </FormLabel>
                      <Input
                        value={otherIndustryText}
                        onChange={handleOtherIndustryChange}
                        placeholder="e.g., Gaming, Cryptocurrency, etc."
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                        }}
                      />
                      <FormErrorMessage>{companyTypeErrors.otherIndustry}</FormErrorMessage>
                    </FormControl>
                  </Box>
                )}

                <FormErrorMessage>{companyTypeErrors.industries}</FormErrorMessage>
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