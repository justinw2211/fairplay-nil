// frontend/src/pages/DealWizard/ActivityForm_Other.jsx
import { useState, useEffect } from 'react';
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
  Input,
  Text,
  Textarea,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  HelpCircle,
  Calendar,
} from 'lucide-react';

const ActivityForm_Other = ({ onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal, fetchDealById } = useDeal();

  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (currentDeal?.obligations?.['other']) {
      const otherData = currentDeal.obligations['other'];
      setActivityName(otherData.name || "");
      setActivityDescription(otherData.description || "");
      setDueDate(otherData.dueDate || "");
    }
  }, [currentDeal]);

  const isFormValid = () => {
    return activityName.trim() && activityDescription.trim();
  };

  const handleNext = async () => {
    const formattedData = {
      name: activityName,
      description: activityDescription,
      dueDate: dueDate,
    };

    // Get the existing activity entry to preserve sequence and completed status
    const existingActivity = currentDeal.obligations?.['other'] || {};

    let baseDeal = currentDeal;
    try {
      baseDeal = await fetchDealById(dealId);
    } catch (_e) {}
    await updateDeal(dealId, {
      obligations: {
        ...(baseDeal?.obligations || currentDeal.obligations || {}),
        'other': {
          ...existingActivity,
          ...formattedData,
        },
      },
    });

    onNext();
  };

  const progressPercentage = ((currentActivity - 1) / totalActivities) * 100;

  return (
    <Container maxW="2xl" py={6}>
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
              <Icon as={HelpCircle} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Activity Details: Other
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Provide details for your custom activity.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Activity Name Input */}
            <FormControl>
              <FormLabel
                htmlFor="activity-name"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Activity Name *
              </FormLabel>
              <Input
                id="activity-name"
                type="text"
                placeholder="e.g., 'Podcast appearance', 'Brand ambassador program'"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                h="12"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
                required
              />
            </FormControl>

            {/* Activity Description */}
            <FormControl isInvalid={showError && !activityDescription.trim()}>
              <FormLabel
                htmlFor="activity-description"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Activity Description *
              </FormLabel>
              <Textarea
                id="activity-description"
                placeholder="Describe what you'll be doing for this activity..."
                value={activityDescription}
                onChange={(e) => {
                  setActivityDescription(e.target.value);
                  if (showError && e.target.value.trim()) {
                    setShowError(false);
                  }
                }}
                h="32"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
                required
              />
              <FormErrorMessage>
                Please provide a description of the activity.
              </FormErrorMessage>
            </FormControl>

            {/* Due Date Input */}
            <FormControl>
              <FormLabel
                htmlFor="due-date"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Due Date (optional)
              </FormLabel>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
            <Flex justify="space-between" align="center" pt={8}>
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
                  onClick={() => {
                    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
                    navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
                  }}
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

export default ActivityForm_Other;