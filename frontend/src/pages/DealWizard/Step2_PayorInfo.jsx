// frontend/src/pages/DealWizard/Step2_PayorInfo.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/phoneUtils';

const Step2_PayorInfo = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [payorType, setPayorType] = useState('');
  const [payorName, setPayorName] = useState('');
  const [payorEmail, setPayorEmail] = useState('');
  const [payorPhone, setPayorPhone] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (deal) {
      setPayorType(deal.payor_type || '');
      setPayorName(deal.payor_name || '');
      setPayorEmail(deal.payor_email || '');
      setPayorPhone(deal.payor_phone || '');
    }
  }, [deal]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setPayorEmail(email);
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
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
    navigate(`/add/deal/terms/${dealId}`);
  };

  const handleNext = async () => {
    if (payorEmail && !validateEmail(payorEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    await updateDeal(dealId, {
      payor_type: payorType,
      payor_name: payorName,
      payor_email: payorEmail,
      payor_phone: payorPhone,
    });
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
              <Text color="brand.textSecondary" fontWeight="medium">Step 3 of 9</Text>
              <Text color="brand.textSecondary">33.3% Complete</Text>
            </Flex>
            <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
              <Box
                bg="brand.accentPrimary"
                h="2"
                w="33.3%"
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
  );
};

export default Step2_PayorInfo;