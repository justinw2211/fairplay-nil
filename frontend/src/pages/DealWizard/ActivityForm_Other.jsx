// frontend/src/pages/DealWizard/ActivityForm_Other.jsx
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

const ActivityForm_Other = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (deal?.obligations?.['Other']) {
      const otherData = deal.obligations['Other'];
      setActivityName(otherData.name || "");
      setActivityDescription(otherData.description || "");
      setDueDate(otherData.dueDate || "");
    }
  }, [deal]);

  const isFormValid = () => {
    return activityName.trim() && activityDescription.trim();
  };

  const handleNext = async () => {
    if (!activityDescription.trim()) {
      setShowError(true);
      return;
    }

    const formattedData = {
      name: activityName.trim(),
      description: activityDescription.trim(),
      dueDate,
    };

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'Other': formattedData,
      },
    });
    navigate(nextStepUrl);
  };

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
                Step 4 of 8
              </Text>
              <Text color="brand.textSecondary">
                50% Complete
              </Text>
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
                If you don't see your activity or deliverable reflected in any of the previous categories, please add a description of the obligation you are fulfilling below.
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
                placeholder="e.g., 'Charity Gala Host'"
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

            {/* Description Textarea */}
            <FormControl isInvalid={showError}>
              <FormLabel
                htmlFor="activity-description"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Description of activity or deliverable *
              </FormLabel>
              <Textarea
                id="activity-description"
                placeholder="Please provide a detailed description of what you will be doing, including specific deliverables, timeline, and any requirements. For example: 'Host a charity gala event for 200+ attendees, including opening remarks, award presentations, and meet-and-greet with donors. Event scheduled for 3 hours with formal attire required.'"
                value={activityDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    setActivityDescription(value);
                    if (showError && value.trim()) {
                      setShowError(false);
                    }
                  }
                }}
                minH="140px"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
                _invalid={{
                  borderColor: "red.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-red-500)",
                }}
                resize="none"
                rows={6}
                required
              />
              <Flex justify="space-between" align="center" mt={1}>
                <FormErrorMessage margin={0}>Description is required</FormErrorMessage>
                <Text fontSize="xs" color="brand.textSecondary">
                  {activityDescription.length}/1000
                </Text>
              </Flex>
            </FormControl>

            {/* Due Date Input */}
            <FormControl>
              <FormLabel
                htmlFor="due-date"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Due Date or Event Date (optional)
              </FormLabel>
              <Box position="relative">
                <Input
                  id="due-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  h="12"
                  fontSize="base"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                  pr="10"
                />
                <Icon
                  as={Calendar}
                  position="absolute"
                  right="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                  pointerEvents="none"
                />
              </Box>
              <Text fontSize="sm" color="brand.textSecondary" mt={2}>
                If this activity has a specific deadline or event date, please specify it here.
              </Text>
            </FormControl>

            {/* Help Box */}
            <Box
              p={4}
              bg="gray.50"
              rounded="lg"
              borderWidth="1px"
              borderColor="brand.accentSecondary"
              w="full"
            >
              <Flex gap={3}>
                <Icon
                  as={HelpCircle}
                  w="5"
                  h="5"
                  color="brand.accentPrimary"
                  mt="1"
                  flexShrink={0}
                />
                <Box>
                  <Text fontWeight="semibold" color="brand.textPrimary">
                    Need help describing your activity?
                  </Text>
                  <Text fontSize="sm" color="brand.textSecondary" mt={2} lineHeight="relaxed">
                    Include details such as: What exactly will you be doing? How long will it take? Are there specific requirements or deliverables? Will this be a one-time event or ongoing commitment?
                  </Text>
                </Box>
              </Flex>
            </Box>

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
                  onClick={() => navigate(`/add/deal/activities/select/${dealId}`)}
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