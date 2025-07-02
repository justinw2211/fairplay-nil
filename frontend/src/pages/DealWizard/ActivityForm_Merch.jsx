// frontend/src/pages/DealWizard/ActivityForm_Merch.jsx
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
  Grid,
  GridItem,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  ShoppingBag,
  Calendar,
  Percent,
} from 'lucide-react';

const ActivityForm_Merch = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [merchandiseTypes, setMerchandiseTypes] = useState("");
  const [salesPlatform, setSalesPlatform] = useState("");
  const [royaltiesDescription, setRoyaltiesDescription] = useState("");
  const [revenuePercentage, setRevenuePercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (deal?.obligations?.['Merchandise']) {
      const merchData = deal.obligations['Merchandise'];
      setMerchandiseTypes(merchData.types || "");
      setSalesPlatform(merchData.platform || "");
      setRoyaltiesDescription(merchData.description || "");
      setRevenuePercentage(merchData.percentage || "");
      setStartDate(merchData.startDate || "");
      setEndDate(merchData.endDate || "");
    }
  }, [deal]);

  const isFormValid = () => {
    return merchandiseTypes.trim() && 
           royaltiesDescription.trim() && 
           startDate && 
           endDate;
  };

  const handleNext = async () => {
    if (!royaltiesDescription.trim()) {
      setShowError(true);
      return;
    }

    const formattedData = {
      types: merchandiseTypes.trim(),
      platform: salesPlatform.trim(),
      description: royaltiesDescription.trim(),
      percentage: revenuePercentage,
      startDate,
      endDate,
    };

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'Merchandise': formattedData,
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
              <Icon as={ShoppingBag} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Activity Details: Selling Merchandise
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Your payor sells items with your name, image, or likeness, like jerseys or bobbleheads. Often you will receive a percentage of revenue of these items as payment.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Merchandise Types Input */}
            <FormControl>
              <FormLabel
                htmlFor="merchandise-types"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Type(s) of Merchandise *
              </FormLabel>
              <Input
                id="merchandise-types"
                type="text"
                placeholder="e.g., 'T-shirts, signed posters, hats'"
                value={merchandiseTypes}
                onChange={(e) => setMerchandiseTypes(e.target.value)}
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

            {/* Sales Platform Input */}
            <FormControl>
              <FormLabel
                htmlFor="sales-platform"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Sales Platform / Vendor (optional)
              </FormLabel>
              <Input
                id="sales-platform"
                type="text"
                placeholder="e.g., 'Shopify, Etsy, personal website'"
                value={salesPlatform}
                onChange={(e) => setSalesPlatform(e.target.value)}
                h="12"
                fontSize="base"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                }}
              />
            </FormControl>

            {/* Revenue Percentage Input */}
            <FormControl>
              <FormLabel
                htmlFor="revenue-percentage"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Percentage of Sales You Will Receive (optional)
              </FormLabel>
              <InputGroup>
                <Input
                  id="revenue-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g., 15"
                  value={revenuePercentage}
                  onChange={(e) => setRevenuePercentage(e.target.value)}
                  h="12"
                  fontSize="base"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                  pr="12"
                />
                <InputRightElement h="12" w="12">
                  <Icon
                    as={Percent}
                    w="4"
                    h="4"
                    color="brand.textSecondary"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Description Textarea */}
            <FormControl isInvalid={showError}>
              <FormLabel
                htmlFor="royalties-description"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Description of items being sold *
              </FormLabel>
              <Textarea
                id="royalties-description"
                placeholder="e.g., '15% of net sales on all t-shirts, $5 per signed poster sold...'"
                value={royaltiesDescription}
                onChange={(e) => {
                  setRoyaltiesDescription(e.target.value);
                  if (showError && e.target.value.trim()) {
                    setShowError(false);
                  }
                }}
                minH="120px"
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
                required
              />
              <FormErrorMessage>Description is required</FormErrorMessage>
            </FormControl>

            {/* Date Range */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Sales Period *
              </FormLabel>
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel
                      htmlFor="start-date"
                      fontSize="sm"
                      fontWeight="medium"
                      color="brand.textPrimary"
                    >
                      Start Date
                    </FormLabel>
                    <Box position="relative">
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        h="12"
                        fontSize="base"
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                        }}
                        required
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
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel
                      htmlFor="end-date"
                      fontSize="sm"
                      fontWeight="medium"
                      color="brand.textPrimary"
                    >
                      End Date
                    </FormLabel>
                    <Box position="relative">
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        h="12"
                        fontSize="base"
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                        }}
                        required
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
                  </FormControl>
                </GridItem>
              </Grid>
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

export default ActivityForm_Merch;