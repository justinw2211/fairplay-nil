// frontend/src/pages/DealWizard/ActivityForm_Endorsements.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Text,
  Textarea,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Award,
} from 'lucide-react';

const ActivityForm_Endorsements = ({ onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal, fetchDealById } = useDeal();

  const [selectedEndorsements, setSelectedEndorsements] = useState([]);
  const [endorsementDetails, setEndorsementDetails] = useState({});
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const endorsementTypes = [
    { id: "sports-equipment", name: "Sports Equipment" },
    { id: "apparel", name: "Apparel & Footwear" },
    { id: "nutrition", name: "Nutrition/Supplements" },
    { id: "technology", name: "Technology" },
    { id: "automotive", name: "Automotive" },
    { id: "food-beverage", name: "Food & Beverage" },
    { id: "gaming", name: "Gaming" },
    { id: "lifestyle", name: "Lifestyle Products" },
    { id: "financial", name: "Financial Services" },
    { id: "other", name: "Other" }
  ];

  useEffect(() => {
    if (currentDeal?.obligations?.['endorsements']) {
      const endorsementData = currentDeal.obligations['endorsements'];
      setSelectedEndorsements(endorsementData.selectedTypes || []);
      setEndorsementDetails(endorsementData.details || {});
      setDescription(endorsementData.description || "");
      setDuration(endorsementData.duration || "");
    }
  }, [currentDeal]);

  const handleEndorsementToggle = (endorsementId, checked) => {
    if (checked) {
      setSelectedEndorsements([...selectedEndorsements, endorsementId]);
      setEndorsementDetails({
        ...endorsementDetails,
        [endorsementId]: {
          id: endorsementId,
          name: endorsementTypes.find(e => e.id === endorsementId)?.name || "",
          usage: "",
          exclusivity: false,
        },
      });
    } else {
      setSelectedEndorsements(selectedEndorsements.filter(e => e !== endorsementId));
      const newDetails = { ...endorsementDetails };
      delete newDetails[endorsementId];
      setEndorsementDetails(newDetails);
    }
  };

  const updateEndorsementDetail = (endorsementId, field, value) => {
    setEndorsementDetails({
      ...endorsementDetails,
      [endorsementId]: {
        ...endorsementDetails[endorsementId],
        [field]: value,
      },
    });
  };

  const isFormValid = () => {
    return selectedEndorsements.length > 0 && description.trim();
  };

  const handleNext = async () => {
    // Align saved keys with what we load in useEffect (selectedTypes, details, description, duration)
    const formattedData = {
      selectedTypes: selectedEndorsements,
      details: endorsementDetails,
      description,
      duration,
    };

    // Get the existing activity entry to preserve sequence and completed status
    const existingActivity = currentDeal.obligations?.['endorsements'] || {};

    // Merge with freshest obligations from the server to avoid overwrites
    let baseDeal = currentDeal;
    try {
      baseDeal = await fetchDealById(dealId);
    } catch (_e) {}
    await updateDeal(dealId, {
      obligations: {
        ...(baseDeal?.obligations || currentDeal.obligations || {}),
        'endorsements': {
          ...existingActivity,
          ...formattedData,
        },
      },
    });

    onNext();
  };

  const handleBack = async () => {
    const formattedData = {
      selectedTypes: selectedEndorsements,
      details: endorsementDetails,
      description,
      duration,
    };

    const existingActivity = currentDeal.obligations?.['endorsements'] || {};

    await updateDeal(dealId, {
      obligations: {
        ...currentDeal.obligations,
        'endorsements': {
          ...existingActivity,
          ...formattedData,
        },
      },
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
  };

  const progressPercentage = ((currentActivity - 1) / totalActivities) * 100;

  return (
    <Container maxW="4xl" py={6}>
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
                Activity {currentActivity} of {totalActivities}
              </Text>
              <Text color="brand.textSecondary">
                {progressPercentage.toFixed(1)}% Complete
              </Text>
            </Flex>
            <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
              <Box
                bg="brand.accentPrimary"
                h="2"
                w={`${progressPercentage}%`}
                rounded="full"
                transition="width 0.5s ease-out"
              />
            </Box>
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
              <Icon as={Award} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Product Endorsements
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Configure your product endorsement details
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Endorsement Types Selection */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Select product categories *
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {endorsementTypes.map((endorsement) => {
                  const isSelected = selectedEndorsements.includes(endorsement.id);
                  return (
                    <Box
                      key={endorsement.id}
                      border="1px"
                      borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                      rounded="lg"
                      p={4}
                      transition="all 0.2s"
                      cursor="pointer"
                      bg={isSelected ? "brand.backgroundLight" : "white"}
                      onClick={() => handleEndorsementToggle(endorsement.id, !isSelected)}
                      _hover={{ borderColor: "brand.accentPrimary", bg: "brand.backgroundLight" }}
                    >
                      <Flex gap={3} align="center">
                        <Checkbox
                          isChecked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleEndorsementToggle(endorsement.id, e.target.checked);
                          }}
                          borderColor="brand.accentSecondary"
                          sx={{
                            'span.chakra-checkbox__control': {
                              _checked: {
                                bg: 'brand.accentPrimary',
                                borderColor: 'brand.accentPrimary',
                              },
                            },
                          }}
                        />
                        <Text color="brand.textPrimary" fontWeight="medium">
                          {endorsement.name}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </FormControl>

            {/* Endorsement Details */}
            {selectedEndorsements.length > 0 && (
              <VStack spacing={6} w="full">
                <Text color="brand.textPrimary" fontWeight="semibold" fontSize="lg">
                  Endorsement Details
                </Text>
                {selectedEndorsements.map((endorsementId) => {
                  const endorsement = endorsementTypes.find(e => e.id === endorsementId);
                  const details = endorsementDetails[endorsementId] || {};

                  return (
                    <Box
                      key={endorsementId}
                      w="full"
                      border="1px"
                      borderColor="brand.accentSecondary"
                      rounded="lg"
                      p={6}
                      bg="white"
                    >
                      <Text color="brand.textPrimary" fontWeight="semibold" mb={4}>
                        {endorsement?.name}
                      </Text>

                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm" color="brand.textSecondary">
                            How will you use/display this product?
                          </FormLabel>
                          <Input
                            value={details.usage || ""}
                            onChange={(e) => updateEndorsementDetail(endorsementId, 'usage', e.target.value)}
                            placeholder="e.g., 'Wear during games', 'Use in training', 'Display in social media'"
                            h="10"
                            borderColor="brand.accentSecondary"
                            _focus={{
                              borderColor: "brand.accentPrimary",
                              boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                            }}
                          />
                        </FormControl>

                        <FormControl>
                          <Checkbox
                            isChecked={details.exclusivity || false}
                            onChange={(e) => updateEndorsementDetail(endorsementId, 'exclusivity', e.target.checked)}
                            borderColor="brand.accentSecondary"
                            sx={{
                              'span.chakra-checkbox__control': {
                                _checked: {
                                  bg: 'brand.accentPrimary',
                                  borderColor: 'brand.accentPrimary',
                                },
                              },
                            }}
                          >
                            <Text fontSize="sm" color="brand.textSecondary">
                              This is an exclusive endorsement (I cannot endorse competing products)
                            </Text>
                          </Checkbox>
                        </FormControl>
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}

            {/* General Description */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Overall endorsement description *
              </FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the overall scope of your endorsement activities..."
                h="24"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
              />
            </FormControl>

            {/* Duration */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Endorsement duration (optional)
              </FormLabel>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., '6 months', '1 year', 'Duration of college career'"
                h="12"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
              />
            </FormControl>

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
                  color: "brand.textPrimary",
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
                    color: "brand.textPrimary",
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
                          shadow: "xl",
                        }
                      : {}
                  }
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
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

export default ActivityForm_Endorsements;