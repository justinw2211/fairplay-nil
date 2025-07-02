import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';

const Step5_Compliance = ({ nextStepUrl }) => {
  const { dealId } = useParams();
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
        { value: "not-sure", label: "Not sure" }
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
    const allQuestionsAnswered = complianceQuestions.every(q => q.value);
    const additionalInfoComplete = complianceQuestions.every(q => {
      if (q.additionalInfo?.show) {
        return q.additionalInfo.value?.trim();
      }
      return true;
    });
    return allQuestionsAnswered && additionalInfoComplete;
  };

  const handleNext = async () => {
    const formattedData = {
      licensingRights,
      licensingInfo,
      schoolBrandVisible,
      schoolBrandInfo,
      exclusiveRights,
      conflictingSponsorships,
      conflictingInfo,
      professionalRep,
      restrictedCategories
    };

    await updateDeal(dealId, {
      compliance: formattedData
    });
    navigate(nextStepUrl);
  };

  return (
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
                Step 5 of 8
              </Text>
              <Text color="brand.textSecondary">
                62.5% Complete
              </Text>
            </Flex>
            <Progress
              value={62.5}
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
                    <Text fontSize="sm" color="brand.textSecondary" mt={2}>
                      {question.description}
                    </Text>
                  )}
                  
                  <RadioGroup
                    value={question.value}
                    onChange={question.setValue}
                    mt={4}
                  >
                    <VStack align="start" spacing={3}>
                      {question.options.map(option => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          size="lg"
                          colorScheme="brand"
                        >
                          <Box>
                            <Text fontWeight="medium">{option.label}</Text>
                            {option.value === "not-sure" && (
                              <Text fontSize="sm" color="brand.textSecondary" ml={6}>
                                Select this if you need assistance determining the answer
                              </Text>
                            )}
                          </Box>
                        </Radio>
                      ))}
                    </VStack>
                  </RadioGroup>

                  {question.additionalInfo?.show && (
                    <Box ml={4} mt={4}>
                      <FormLabel color="brand.accentPrimary" fontWeight="medium" fontSize="sm">
                        Please provide additional information *
                      </FormLabel>
                      <Textarea
                        value={question.additionalInfo.value}
                        onChange={(e) => question.additionalInfo.setValue(e.target.value)}
                        placeholder="Please provide more details about your situation..."
                        minH="100px"
                        fontSize="base"
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                        }}
                        resize="none"
                        rows={4}
                        required
                      />
                    </Box>
                  )}
                </FormControl>
              </Box>
            ))}

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
                onClick={() => navigate('/dashboard')}
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
                  onClick={() => navigate(`/add/deal/activities/select/${dealId}`)}
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
                  bg={isFormValid() ? "brand.accentPrimary" : "brand.accentSecondary"}
                  color="white"
                  isDisabled={!isFormValid()}
                  onClick={handleNext}
                  transition="all 0.2s"
                  _hover={
                    isFormValid()
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
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default Step5_Compliance;
