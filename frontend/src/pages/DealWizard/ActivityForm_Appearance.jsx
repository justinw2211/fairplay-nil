// frontend/src/pages/DealWizard/ActivityForm_Appearance.jsx
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
  Grid,
  Icon,
  Input,
  Text,
  VStack,
  Textarea,
  Checkbox,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Users,
  Plus,
  Minus,
} from 'lucide-react';

const appearanceTypes = [
  { id: "not-determined", name: "Not yet determined" },
  { id: "production-shoot", name: "Production shoot" },
  { id: "interview", name: "Interview" },
  { id: "meet-greet", name: "Meet and greet" },
  { id: "autograph-signing", name: "Autograph signing session" },
  { id: "sport-demonstration", name: "Sport demonstration or camp" },
  { id: "other", name: "Other (please specify)" },
];

const ActivityForm_Appearance = ({ onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [selectedAppearances, setSelectedAppearances] = useState([]);
  const [appearanceDetails, setAppearanceDetails] = useState({});
  const [description, setDescription] = useState("");
  const [otherAppearance, setOtherAppearance] = useState("");

  useEffect(() => {
    if (deal?.obligations?.['Appearance']) {
      const appearanceData = deal.obligations['Appearance'];
      setSelectedAppearances(appearanceData.selectedTypes || []);
      setAppearanceDetails(appearanceData.details || {});
      setDescription(appearanceData.description || "");
      setOtherAppearance(appearanceData.otherAppearance || "");
    }
  }, [deal]);

  const handleAppearanceToggle = (appearanceId, checked) => {
    if (checked) {
      setSelectedAppearances([...selectedAppearances, appearanceId]);
      setAppearanceDetails({
        ...appearanceDetails,
        [appearanceId]: {
          id: appearanceId,
          name: appearanceTypes.find(a => a.id === appearanceId)?.name || "",
          quantity: 1,
          hours: 1,
        },
      });
    } else {
      setSelectedAppearances(selectedAppearances.filter(a => a !== appearanceId));
      const newDetails = { ...appearanceDetails };
      delete newDetails[appearanceId];
      setAppearanceDetails(newDetails);

      if (appearanceId === "other") {
        setOtherAppearance("");
      }
    }
  };

  const updateAppearanceDetail = (appearanceId, field, value) => {
    setAppearanceDetails({
      ...appearanceDetails,
      [appearanceId]: {
        ...appearanceDetails[appearanceId],
        [field]: Math.max(1, value),
      },
    });
  };

  const isFormValid = () => {
    if (selectedAppearances.length === 0) return false;
    if (selectedAppearances.includes("other") && !otherAppearance.trim()) return false;
    return true;
  };

  const handleNext = async () => {
    const formattedData = {
      selectedTypes: selectedAppearances,
      details: appearanceDetails,
      description,
      otherAppearance,
    };

    // Get the existing activity entry to preserve sequence and completed status
    const existingActivity = deal.obligations?.['appearance'] || {};

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'appearance': {
          ...existingActivity, // Preserve sequence, completed, etc.
          ...formattedData,    // Add the form data
        },
      },
    });
    onNext();
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
              <Icon as={Users} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Activity Details: Appearance
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Live in-person or virtual events like camps, meet and greets, or photoshoots. 
                If your payor has asked you to do "up to" a certain number of events, please input the minimum number.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Appearance Type Selection */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Appearance Type *
              </FormLabel>
              <VStack spacing={3} align="stretch">
                {appearanceTypes.map((appearance) => {
                  const isSelected = selectedAppearances.includes(appearance.id);
                  return (
                    <Box
                      key={appearance.id}
                      borderWidth="1px"
                      borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                      rounded="lg"
                      p={4}
                      cursor="pointer"
                      bg={isSelected ? "brand.backgroundLight" : "white"}
                      onClick={() => handleAppearanceToggle(appearance.id, !isSelected)}
                      _hover={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.backgroundLight",
                      }}
                    >
                      <Flex align="center" gap={3}>
                        <Checkbox
                          isChecked={isSelected}
                          onChange={(e) => handleAppearanceToggle(appearance.id, e.target.checked)}
                          colorScheme="brand"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Text fontWeight="medium" color="brand.textPrimary">
                          {appearance.name}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </FormControl>

            {/* Other Appearance Specification */}
            {selectedAppearances.includes("other") && (
              <Box
                p={4}
                bg="brand.backgroundLight"
                rounded="lg"
                borderWidth="1px"
                borderColor="brand.accentSecondary"
              >
                <FormControl>
                  <FormLabel color="brand.textPrimary" fontWeight="semibold">
                    Please specify the other appearance type *
                  </FormLabel>
                  <Input
                    value={otherAppearance}
                    onChange={(e) => setOtherAppearance(e.target.value)}
                    placeholder="e.g., 'Podcast recording', 'Brand ambassador event', 'Product launch'"
                    h="12"
                    fontSize="base"
                    borderColor="brand.accentSecondary"
                    _focus={{
                      borderColor: "brand.accentPrimary",
                      boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                    }}
                  />
                </FormControl>
              </Box>
            )}

            {/* Quantity and Hours for Selected Appearances */}
            {selectedAppearances.length > 0 && (
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Quantity and Hours for Each Appearance Type
                </FormLabel>
                <VStack spacing={4}>
                  {selectedAppearances.map((appearanceId) => {
                    const appearance = appearanceTypes.find(a => a.id === appearanceId);
                    const details = appearanceDetails[appearanceId];
                    const displayName = appearanceId === "other" && otherAppearance ? 
                      otherAppearance : appearance?.name || "";

                    return (
                      <Box
                        key={appearanceId}
                        w="full"
                        borderWidth="1px"
                        borderColor="brand.accentSecondary"
                        rounded="lg"
                        p={4}
                        bg="brand.backgroundLight"
                      >
                        <Text fontSize="lg" fontWeight="semibold" color="brand.textPrimary" mb={4}>
                          {displayName}
                        </Text>

                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={6}>
                          {/* Quantity Control */}
                          <Box>
                            <FormLabel color="brand.textPrimary" fontWeight="medium">
                              Number of Events
                            </FormLabel>
                            <Flex align="center" justify="center" gap={3}>
                              <Button
                                variant="outline"
                                size="sm"
                                w="10"
                                h="10"
                                p="0"
                                rounded="full"
                                borderColor="brand.accentSecondary"
                                onClick={() => updateAppearanceDetail(appearanceId, "quantity", details.quantity - 1)}
                                isDisabled={details.quantity <= 1}
                                _hover={{
                                  bg: "brand.accentPrimary",
                                  color: "white",
                                  borderColor: "brand.accentPrimary",
                                }}
                              >
                                <Icon as={Minus} w="4" h="4" />
                              </Button>

                              <Box
                                w="16"
                                h="12"
                                bg="white"
                                rounded="lg"
                                borderWidth="2px"
                                borderColor="brand.accentSecondary"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary">
                                  {details.quantity}
                                </Text>
                              </Box>

                              <Button
                                variant="outline"
                                size="sm"
                                w="10"
                                h="10"
                                p="0"
                                rounded="full"
                                borderColor="brand.accentSecondary"
                                onClick={() => updateAppearanceDetail(appearanceId, "quantity", details.quantity + 1)}
                                _hover={{
                                  bg: "brand.accentPrimary",
                                  color: "white",
                                  borderColor: "brand.accentPrimary",
                                }}
                              >
                                <Icon as={Plus} w="4" h="4" />
                              </Button>
                            </Flex>
                          </Box>

                          {/* Hours Control */}
                          <Box>
                            <FormLabel color="brand.textPrimary" fontWeight="medium">
                              Hours per Event
                            </FormLabel>
                            <Flex align="center" justify="center" gap={3}>
                              <Button
                                variant="outline"
                                size="sm"
                                w="10"
                                h="10"
                                p="0"
                                rounded="full"
                                borderColor="brand.accentSecondary"
                                onClick={() => updateAppearanceDetail(appearanceId, "hours", details.hours - 1)}
                                isDisabled={details.hours <= 1}
                                _hover={{
                                  bg: "brand.accentPrimary",
                                  color: "white",
                                  borderColor: "brand.accentPrimary",
                                }}
                              >
                                <Icon as={Minus} w="4" h="4" />
                              </Button>

                              <Box
                                w="16"
                                h="12"
                                bg="white"
                                rounded="lg"
                                borderWidth="2px"
                                borderColor="brand.accentSecondary"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary">
                                  {details.hours}
                                </Text>
                              </Box>

                              <Button
                                variant="outline"
                                size="sm"
                                w="10"
                                h="10"
                                p="0"
                                rounded="full"
                                borderColor="brand.accentSecondary"
                                onClick={() => updateAppearanceDetail(appearanceId, "hours", details.hours + 1)}
                                _hover={{
                                  bg: "brand.accentPrimary",
                                  color: "white",
                                  borderColor: "brand.accentPrimary",
                                }}
                              >
                                <Icon as={Plus} w="4" h="4" />
                              </Button>
                            </Flex>
                          </Box>
                        </Grid>
                      </Box>
                    );
                  })}
                </VStack>
              </FormControl>
            )}

            {/* General Description */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                General Description (optional)
              </FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional details about your appearance requirements, special instructions, or other relevant information..."
                minH="120px"
                rows={5}
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
                resize="none"
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

export default ActivityForm_Appearance;