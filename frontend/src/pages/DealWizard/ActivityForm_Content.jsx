// frontend/src/pages/DealWizard/ActivityForm_Content.jsx
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
  Camera,
} from 'lucide-react';

const ActivityForm_Content = ({ onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [quantityOfContent, setQuantityOfContent] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (deal?.obligations?.['Content']) {
      const contentData = deal.obligations['Content'];
      setQuantityOfContent(contentData.quantity || "");
      setContentDescription(contentData.description || "");
    }
  }, [deal]);

  const isFormValid = () => {
    return quantityOfContent && 
           Number.parseInt(quantityOfContent) > 0 && 
           contentDescription.trim();
  };

  const handleDescriptionChange = (e) => {
    setContentDescription(e.target.value);
    if (showError && e.target.value.trim()) {
      setShowError(false);
    }
  };

  const handleNext = async () => {
    const formattedData = {
      quantity: quantityOfContent,
      description: contentDescription,
    };

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'content-for-brand': formattedData,
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
              <Icon as={Camera} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Activity Details: Content for Brand
              </Text>
              <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                Photos or videos you create or share with your payor for them to use on their social media accounts or on their website. This includes creating original content or sharing existing content such as photos from your media day.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={6} pt={0}>
          <VStack spacing={8}>
            {/* Quantity Input */}
            <FormControl>
              <FormLabel
                htmlFor="quantity-of-content"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Quantity of pieces of content *
              </FormLabel>
              <Input
                id="quantity-of-content"
                type="number"
                min="1"
                placeholder="1"
                value={quantityOfContent}
                onChange={(e) => setQuantityOfContent(e.target.value)}
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
                htmlFor="content-description"
                color="brand.textPrimary"
                fontWeight="semibold"
              >
                Description of content used by payor and how used *
              </FormLabel>
              <Textarea
                id="content-description"
                placeholder="Describe the content you will create or share, and how the payor will use it..."
                value={contentDescription}
                onChange={handleDescriptionChange}
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

export default ActivityForm_Content;