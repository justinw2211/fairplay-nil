// frontend/src/pages/DealWizard/ActivityForm_Endorsements.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Grid,
  GridItem,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Award,
  Calendar,
} from 'lucide-react';

const ActivityForm_Endorsements = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [productName, setProductName] = useState("");
  const [endorsementRequirements, setEndorsementRequirements] = useState("");
  const [hasExclusivity, setHasExclusivity] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (deal?.obligations?.['Endorsements']) {
      const endorsementData = deal.obligations['Endorsements'];
      setProductName(endorsementData.productName || "");
      setEndorsementRequirements(endorsementData.requirements || "");
      setHasExclusivity(endorsementData.hasExclusivity || false);
      setStartDate(endorsementData.startDate || "");
      setEndDate(endorsementData.endDate || "");
    }
  }, [deal]);

  const isFormValid = () => {
    return productName.trim() && 
           endorsementRequirements.trim() && 
           startDate && 
           endDate;
  };

  const handleNext = async () => {
    if (!endorsementRequirements.trim()) {
      setShowError(true);
      return;
    }

    const formattedData = {
      productName: productName.trim(),
      requirements: endorsementRequirements.trim(),
      hasExclusivity,
      startDate,
      endDate,
    };

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'Endorsements': formattedData,
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
              <Icon as={Award} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Activity Details: Product Endorsement
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                You wear or use products from your payor in public appearances or competitions. For example, you wear shoes or use equipment (e.g., golf clubs) from your payor at a game, or wear clothing from your payor during interviews.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Product Name Input */}
            <FormControl>
              <FormLabel
                htmlFor="product-name"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Product or Service Name *
              </FormLabel>
              <Input
                id="product-name"
                type="text"
                placeholder="e.g., 'Nike Air Max shoes', 'Gatorade sports drink', 'Wilson tennis racket'"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
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

            {/* Requirements Textarea */}
            <FormControl isInvalid={showError}>
              <FormLabel
                htmlFor="endorsement-requirements"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Description of the products you are endorsing and how they are used *
              </FormLabel>
              <Textarea
                id="endorsement-requirements"
                placeholder="e.g., 'Must wear branded hat during all public appearances for one month, verbally endorse the product in at least two interviews...'"
                value={endorsementRequirements}
                onChange={(e) => {
                  setEndorsementRequirements(e.target.value);
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

            {/* Exclusivity Checkbox */}
            <Box
              p={4}
              bg="gray.50"
              rounded="lg"
              borderWidth="1px"
              borderColor="brand.accentSecondary"
              w="full"
            >
              <Flex align="center" gap={3}>
                <Checkbox
                  id="exclusivity-clause"
                  isChecked={hasExclusivity}
                  onChange={(e) => setHasExclusivity(e.target.checked)}
                  colorScheme="brand"
                >
                  <Text color="brand.textPrimary" fontWeight="medium">
                    Does this deal include an exclusivity clause?
                  </Text>
                </Checkbox>
              </Flex>
              {hasExclusivity && (
                <Text color="brand.textSecondary" fontSize="sm" mt={2} pl={7}>
                  This means you cannot endorse competing products during the endorsement period.
                </Text>
              )}
            </Box>

            {/* Date Range */}
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">
                Endorsement Period *
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

export default ActivityForm_Endorsements;