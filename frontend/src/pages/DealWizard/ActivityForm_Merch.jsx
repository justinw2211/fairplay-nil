// frontend/src/pages/DealWizard/ActivityForm_Merch.jsx
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  ShoppingBag,
} from 'lucide-react';

const ActivityForm_Merch = ({ onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();

  const [selectedMerch, setSelectedMerch] = useState([]);
  const [merchDetails, setMerchDetails] = useState({});
  const [customMerch, setCustomMerch] = useState("");

  const merchTypes = [
    { id: "jerseys", name: "Jerseys" },
    { id: "t-shirts", name: "T-Shirts" },
    { id: "hats", name: "Hats/Caps" },
    { id: "posters", name: "Posters" },
    { id: "bobbleheads", name: "Bobbleheads" },
    { id: "trading-cards", name: "Trading Cards" },
    { id: "keychains", name: "Keychains" },
    { id: "mugs", name: "Mugs" },
    { id: "phone-cases", name: "Phone Cases" },
    { id: "custom", name: "Other (specify)" }
  ];

  useEffect(() => {
    if (currentDeal?.obligations?.['merch-and-products']) {
      const merchData = currentDeal.obligations['merch-and-products'];
      setSelectedMerch(merchData.selectedTypes || []);
      setMerchDetails(merchData.details || {});
      setCustomMerch(merchData.customMerch || "");
    }
  }, [currentDeal]);

  const handleMerchToggle = (merchId, checked) => {
    if (checked) {
      setSelectedMerch([...selectedMerch, merchId]);
      setMerchDetails({
        ...merchDetails,
        [merchId]: {
          id: merchId,
          name: merchTypes.find(m => m.id === merchId)?.name || "",
          quantity: 100,
          price: 25.00,
        },
      });
    } else {
      setSelectedMerch(selectedMerch.filter(m => m !== merchId));
      const newDetails = { ...merchDetails };
      delete newDetails[merchId];
      setMerchDetails(newDetails);

      if (merchId === "custom") {
        setCustomMerch("");
      }
    }
  };

  const updateMerchDetail = (merchId, field, value) => {
    setMerchDetails({
      ...merchDetails,
      [merchId]: {
        ...merchDetails[merchId],
        [field]: value,
      },
    });
  };

  const isFormValid = () => {
    return selectedMerch.length > 0 &&
           (!selectedMerch.includes("custom") || customMerch.trim());
  };

  const handleNext = async () => {
    const formattedData = {
      selectedTypes: selectedMerch,
      details: merchDetails,
      customMerch,
    };

    // Get the existing activity entry to preserve sequence and completed status
    const existingActivity = currentDeal.obligations?.['merch-and-products'] || {};

    await updateDeal(dealId, {
      obligations: {
        ...currentDeal.obligations,
        'merch-and-products': {
          ...existingActivity, // Preserve sequence, completed, etc.
          ...formattedData,    // Add the form data
        },
      },
    });

    onNext();
  };

  const handleBack = async () => {
    const formattedData = {
      selectedTypes: selectedMerch,
      details: merchDetails,
      customMerch,
    };

    const existingActivity = currentDeal.obligations?.['merch-and-products'] || {};

    await updateDeal(dealId, {
      obligations: {
        ...currentDeal.obligations,
        'merch-and-products': {
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
              <Icon as={ShoppingBag} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Merchandise & Products
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Configure your merchandise licensing details
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Merchandise Types Selection */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Select merchandise types *
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {merchTypes.map((merch) => {
                  const isSelected = selectedMerch.includes(merch.id);
                  return (
                    <Box
                      key={merch.id}
                      border="1px"
                      borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                      rounded="lg"
                      p={4}
                      transition="all 0.2s"
                      cursor="pointer"
                      bg={isSelected ? "brand.backgroundLight" : "white"}
                      onClick={() => handleMerchToggle(merch.id, !isSelected)}
                      _hover={{ borderColor: "brand.accentPrimary", bg: "brand.backgroundLight" }}
                    >
                      <Flex gap={3} align="center">
                        <Checkbox
                          isChecked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleMerchToggle(merch.id, e.target.checked);
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
                          {merch.name}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </FormControl>

            {/* Custom Merchandise Input */}
            {selectedMerch.includes("custom") && (
              <Box
                bg="brand.backgroundLight"
                p={6}
                rounded="lg"
                border="1px"
                borderColor="brand.accentSecondary"
              >
                <FormControl>
                  <FormLabel color="brand.textPrimary" fontWeight="semibold">
                    Specify other merchandise type *
                  </FormLabel>
                  <Input
                    value={customMerch}
                    onChange={(e) => setCustomMerch(e.target.value)}
                    placeholder="e.g., 'Water bottles', 'Notebooks', 'Car decals'"
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

            {/* Merchandise Details */}
            {selectedMerch.length > 0 && (
              <VStack spacing={6} w="full">
                <Text color="brand.textPrimary" fontWeight="semibold" fontSize="lg">
                  Merchandise Details
                </Text>
                {selectedMerch.map((merchId) => {
                  const merch = merchTypes.find(m => m.id === merchId);
                  const details = merchDetails[merchId] || {};

                  return (
                    <Box
                      key={merchId}
                      w="full"
                      border="1px"
                      borderColor="brand.accentSecondary"
                      rounded="lg"
                      p={6}
                      bg="white"
                    >
                      <Text color="brand.textPrimary" fontWeight="semibold" mb={4}>
                        {merch?.name} {merchId === "custom" ? `(${customMerch})` : ""}
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm" color="brand.textSecondary">
                            Estimated Quantity
                          </FormLabel>
                          <NumberInput
                            value={details.quantity || 100}
                            onChange={(_, value) => updateMerchDetail(merchId, 'quantity', value)}
                            min={1}
                            max={10000}
                          >
                            <NumberInputField
                              h="10"
                              borderColor="brand.accentSecondary"
                              _focus={{
                                borderColor: "brand.accentPrimary",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                              }}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color="brand.textSecondary">
                            Estimated Price ($)
                          </FormLabel>
                          <NumberInput
                            value={details.price || 25.00}
                            onChange={(_, value) => updateMerchDetail(merchId, 'price', value)}
                            min={0.01}
                            precision={2}
                            step={0.01}
                          >
                            <NumberInputField
                              h="10"
                              borderColor="brand.accentSecondary"
                              _focus={{
                                borderColor: "brand.accentPrimary",
                                boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                              }}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </VStack>
            )}

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

export default ActivityForm_Merch;