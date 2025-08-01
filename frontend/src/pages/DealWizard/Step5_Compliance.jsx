import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Text,
  Textarea,
  VStack,
  RadioGroup,
  Radio,
  Progress,
  HStack,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { formLogger } from '../../utils/logger';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';

const Step5_Compliance = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [licensingRights, setLicensingRights] = useState("");
  const [licensingInfo, setLicensingInfo] = useState("");
  const [schoolBrandVisible, setSchoolBrandVisible] = useState("");
  const [schoolBrandInfo, setSchoolBrandInfo] = useState("");
  const [exclusiveRights, setExclusiveRights] = useState("");
  const [conflictingSponsorships, setConflictingSponsorships] = useState("");
  const [conflictingInfo, setConflictingInfo] = useState("");
  const [professionalRep, setProfessionalRep] = useState("");
  const [restrictedCategories, setRestrictedCategories] = useState("");

  useEffect(() => {
    if (deal?.compliance) {
      setLicensingRights(deal.compliance.licensingRights || "");
      setLicensingInfo(deal.compliance.licensingInfo || "");
      setSchoolBrandVisible(deal.compliance.schoolBrandVisible || "");
      setSchoolBrandInfo(deal.compliance.schoolBrandInfo || "");
      setExclusiveRights(deal.compliance.exclusiveRights || "");
      setConflictingSponsorships(deal.compliance.conflictingSponsorships || "");
      setConflictingInfo(deal.compliance.conflictingInfo || "");
      setProfessionalRep(deal.compliance.professionalRep || "");
      setRestrictedCategories(deal.compliance.restrictedCategories || "");
    }
  }, [deal]);

  const complianceQuestions = [
    {
      id: "licensing-rights",
      question: "In addition to your activities, are you licensing your name, image, or likeness to this business?",
      description: "Select yes if your deal includes terms that allow the payor to use your NIL. For example, posting your photo on their website or social media, selling t-shirts or hats with your name, or use of your digital avatar in a game.",
      value: licensingRights,
      setValue: setLicensingRights,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not-sure", label: "Not Sure" }
      ],
      additionalInfo: {
        value: licensingInfo,
        setValue: setLicensingInfo,
        show: licensingRights === "not-sure"
      }
    },
    {
      id: "school-brand-visible",
      question: "Will your school's brand be visible in any of these activities?",
      description: "Select yes if your school branding will be used or visible in activities that are part of this deal, such as wearing your jersey in an ad or posting social media content at an institution facility.",
      value: schoolBrandVisible,
      setValue: setSchoolBrandVisible,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not-sure", label: "Not sure" }
      ],
      additionalInfo: {
        value: schoolBrandInfo,
        setValue: setSchoolBrandInfo,
        show: schoolBrandVisible === "not-sure"
      }
    },
    {
      id: "exclusive-rights",
      question: "Will you be granting any exclusive rights to this payor?",
      description: "Select yes if your deal includes an agreement that grants your payor sole access to specific benefits. For example, a payor in the clothing industry dictates you can't be sponsored by other clothing brands.",
      value: exclusiveRights,
      setValue: setExclusiveRights,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not-sure", label: "Not sure" }
      ]
    },
    {
      id: "conflicting-sponsorships",
      question: "Does this deal conflict with any of your university's or athletic department's existing sponsorship agreements?",
      value: conflictingSponsorships,
      setValue: setConflictingSponsorships,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not-sure", label: "Not sure" }
      ],
      additionalInfo: {
        value: conflictingInfo,
        setValue: setConflictingInfo,
        show: conflictingSponsorships === "not-sure"
      }
    },
    {
      id: "professional-rep",
      question: "Is a professional representative, such as an agent or lawyer, involved in this deal?",
      value: professionalRep,
      setValue: setProfessionalRep,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ]
    },
    {
      id: "restricted-categories",
      question: "Are there any restricted categories involved in this deal (e.g., gambling, alcohol, banned substances)?",
      value: restrictedCategories,
      setValue: setRestrictedCategories,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" }
      ]
    }
  ];

  const isFormValid = () => {
    formLogger.debug('Validating compliance form');

    return complianceQuestions.every(q => {
      // Base validation - must have a value selected
      if (!q.value) {return false;}

      // If additional info is required (showing) and the value is "not-sure"
      if (q.additionalInfo?.show && q.value === "not-sure") {
        return !!q.additionalInfo.value?.trim();
      }

      // If no additional info is needed or value isn't "not-sure", just need the main value
      return true;
    });
  };

  const handleNext = async () => {
    if (!isFormValid()) {
      formLogger.debug('Form validation failed - missing required answers');
      return;
    }

    // Format the data according to the backend schema
    const formattedData = {
      // Map licensingRights to licenses_nil
      licenses_nil: licensingRights,

      // Map schoolBrandVisible to uses_school_ip
      uses_school_ip: schoolBrandVisible === 'yes',

      // Map exclusiveRights to grant_exclusivity
      grant_exclusivity: exclusiveRights,

      // Store the rest in obligations
      obligations: {
        licensingInfo,
        schoolBrandInfo,
        conflictingSponsorships,
        conflictingInfo,
        professionalRep,
        restrictedCategories
      }
    };

    formLogger.debug('Submitting compliance data');

    try {
      await updateDeal(dealId, formattedData);
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/compensation/${dealId}${typeParam}`);
    } catch (error) {
      formLogger.error('Error updating deal', { error: error.message });
    }
  };

  const handleBack = () => {
    // Need to get the last completed activity or the last activity in sequence
    if (deal?.obligations) {
      const selectedActivities = Object.entries(deal.obligations)
        .sort((a, b) => a[1].sequence - b[1].sequence)
        .map(([activity]) => activity);

      // Find the last activity (either the last completed one or the last in sequence)
      const lastActivity = deal.lastCompletedActivity || selectedActivities[selectedActivities.length - 1];

      if (lastActivity) {
        const encodedActivity = encodeURIComponent(lastActivity);
        const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
        navigate(`/add/deal/activity/${encodedActivity}/${dealId}${typeParam}`);
        return;
      }
    }

    // Fallback to activities selection if we can't determine the last activity
    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
  };

  return (
    <DealWizardStepWrapper stepNumber={5} stepName="Compliance Review">
      <Container maxW="3xl" py={6}>
        <Box
          borderWidth="1px"
          borderColor="brand.accentSecondary"
          shadow="lg"
          bg="white"
          rounded="lg"
        >
          {/* Header Section */}
          <Box p={6}>
            {/* Progress Indicator */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">
                  Step 6 of 10
                </Text>
                <Text color="brand.textSecondary">
                  60% Complete
                </Text>
              </Flex>
              <Progress
                value={60}
                w="full"
                h="2"
                bg="brand.accentSecondary"
                sx={{
                  '& > div': {
                    bg: 'brand.accentPrimary',
                    transition: 'width 0.5s ease-out'
                  }
                }}
                rounded="full"
              />
            </VStack>

            {/* Title Section */}
            <Flex gap={3} mb={4}>
              <Box
                w="12"
                h="12"
                bg="brand.accentPrimary"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
              >
                <Icon as={Shield} w="6" h="6" color="white" />
              </Box>
              <Box>
                <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                  Compliance Questions
                </Text>
                <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                  Please answer the following questions to help ensure your deal is compliant with school and NCAA policies.
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Questions Section */}
          <Box p={6} pt={0}>
            <VStack spacing={10}>
              {complianceQuestions.map((question, index) => (
                <Box key={question.id} w="full">
                  <FormControl>
                    <FormLabel color="brand.textPrimary" fontWeight="semibold">
                      {index + 1}. {question.question}
                    </FormLabel>
                    {question.description && (
                      <Text fontSize="sm" color="brand.textSecondary" mt={2} mb={4}>
                        {question.description}
                      </Text>
                    )}

                    <RadioGroup
                      value={question.value}
                      onChange={question.setValue}
                      mt={4}
                    >
                      <HStack spacing={4}>
                        {question.options.map((option) => (
                          <Box
                            key={option.value}
                            onClick={() => question.setValue(option.value)}
                            cursor="pointer"
                            bg={question.value === option.value ? "brand.accentPrimary" : "white"}
                            color={question.value === option.value ? "white" : "brand.textPrimary"}
                            px={6}
                            py={2}
                            rounded="full"
                            border="2px"
                            borderColor={question.value === option.value ? "brand.accentPrimary" : "brand.accentSecondary"}
                            _hover={{
                              bg: question.value === option.value ? "brand.accentPrimary" : "brand.backgroundLight",
                            }}
                            transition="all 0.2s"
                          >
                            {option.label}
                          </Box>
                        ))}
                      </HStack>
                    </RadioGroup>

                    {question.additionalInfo?.show && (
                      <Box mt={4}>
                        <FormControl>
                          <FormLabel color="brand.textSecondary" fontSize="sm">
                            Please provide additional details:
                          </FormLabel>
                          <Textarea
                            value={question.additionalInfo.value}
                            onChange={(e) => question.additionalInfo.setValue(e.target.value)}
                            placeholder="Enter your explanation here..."
                            rows={3}
                            resize="none"
                            borderColor="brand.accentSecondary"
                            _focus={{
                              borderColor: "brand.accentPrimary",
                              boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                            }}
                          />
                        </FormControl>
                      </Box>
                    )}
                  </FormControl>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Footer Navigation */}
          <Box p={6} borderTop="1px" borderColor="brand.accentSecondary">
            <Flex justify="space-between">
              <Button
                leftIcon={<Icon as={ChevronLeft} />}
                variant="ghost"
                color="brand.textSecondary"
                onClick={handleBack}
                px={8}
                py={6}
                h="auto"
                fontSize="md"
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Back
              </Button>

              <Flex gap={4}>
                <Button
                  leftIcon={<Icon as={Clock} />}
                  variant="ghost"
                  color="brand.textSecondary"
                  onClick={() => navigate('/dashboard')}
                  px={8}
                  py={6}
                  h="auto"
                  fontSize="md"
                  _hover={{
                    bg: "brand.backgroundLight",
                    color: "brand.textPrimary",
                  }}
                >
                  Finish Later
                </Button>

                <Button
                  rightIcon={<Icon as={ChevronRight} />}
                  variant="solid"
                  bg="brand.accentPrimary"
                  color="white"
                  onClick={handleNext}
                  isDisabled={!isFormValid()}
                  px={8}
                  py={6}
                  h="auto"
                  fontSize="md"
                  _hover={{
                    bg: "brand.accentPrimaryHover",
                  }}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step5_Compliance;
