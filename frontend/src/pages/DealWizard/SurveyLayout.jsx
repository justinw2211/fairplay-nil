import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';

const SurveyLayout = ({
  children,
  currentStep,
  totalSteps,
  title,
  description,
  isNextDisabled,
  onNext,
  backUrl,
}) => {
  const navigate = useNavigate();
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    navigate(backUrl);
  };

  const handleFinishLater = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxW="2xl" py={6}>
      <Box
        borderColor="brand.accentSecondary"
        borderWidth="1px"
        shadow="lg"
        bg="white"
        rounded="lg"
      >
        {/* Header Section */}
        <Box p={6} pb={0}>
          {/* Progress Indicator */}
          <VStack spacing={3} mb={6}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="medium">
                Step {currentStep} of {totalSteps}
              </Text>
              <Text color="brand.textSecondary">
                {progressPercentage}% Complete
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

          {/* Title and Description */}
          <VStack spacing={3} align="start">
            <Heading size="lg" color="brand.textPrimary">
              {title}
            </Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              {description}
            </Text>
          </VStack>
        </Box>

        {/* Content Section */}
        <Box p={6}>
          <VStack spacing={8}>
            {children}

            {/* Navigation Buttons */}
            <Flex justify="space-between" w="full" pt={8}>
              {/* Finish Later Button */}
              <Button
                leftIcon={<Icon as={Clock} />}
                variant="ghost"
                color="brand.textSecondary"
                px={6}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="medium"
                onClick={handleFinishLater}
                _hover={{
                  color: "brand.textPrimary",
                }}
              >
                Finish Later
              </Button>

              {/* Back/Next Buttons */}
              <Flex gap={4}>
                <Button
                  leftIcon={<Icon as={ChevronLeft} />}
                  variant="outline"
                  px={6}
                  py={3}
                  h={12}
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
                  rightIcon={<Icon as={ChevronRight} />}
                  bg={isNextDisabled ? "brand.accentSecondary" : "brand.accentPrimary"}
                  color="white"
                  px={8}
                  py={3}
                  h={12}
                  fontSize="base"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  _hover={
                    !isNextDisabled
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
                  isDisabled={isNextDisabled}
                  onClick={onNext}
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

export default SurveyLayout;