/**
 * DealWizardErrorFallback Component
 * Specialized error fallback UI for DealWizard workflow
 * Provides step-specific messages and recovery options
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Plus,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DealWizardErrorFallback = ({
  error,
  errorId,
  currentStep,
  stepName,
  onRetry,
  onNavigateToSafeLocation,
  recoveryState,
  errorState,
  recoverySuggestions = [],
  showDetails = false,
  ...props
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.200', 'red.700');

  // Step-specific error messages
  const getStepSpecificMessage = (step) => {
    const messages = {
      0: "We encountered an issue while setting up your social media information.",
      1: "We encountered an issue while processing your deal terms.",
      2: "We encountered an issue while processing payor information.",
      3: "We encountered an issue while selecting activities.",
      4: "We encountered an issue while processing activity forms.",
      5: "We encountered an issue while reviewing compliance information.",
      6: "We encountered an issue while processing compensation details.",
      7: "We encountered an issue while uploading your contract.",
      8: "We encountered an issue while reviewing your deal submission.",
      9: "We encountered an issue while running the clearinghouse prediction.",
      10: "We encountered an issue while calculating fair market value.",
      11: "We encountered an issue while processing your submission success."
    };
    return messages[step] || "We encountered an issue while processing your information.";
  };

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
  };

  const handleReturnToDashboard = () => {
    if (onNavigateToSafeLocation) {
      onNavigateToSafeLocation('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleStartNewDeal = () => {
    if (onNavigateToSafeLocation) {
      onNavigateToSafeLocation('/add/deal');
    } else {
      navigate('/add/deal');
    }
  };

  const handleGoHome = () => {
    if (onNavigateToSafeLocation) {
      onNavigateToSafeLocation('/');
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <Box
        maxW="2xl"
        w="full"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={8}
        bg="white"
        shadow="xl"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4}>
            <Box
              w={16}
              h={16}
              bg="red.100"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={AlertTriangle} w={8} h={8} color="red.500" />
            </Box>
            
            <VStack spacing={2}>
              <Heading size="lg" color="red.600">
                Oops! Something went wrong
              </Heading>
              <Text color="gray.600" textAlign="center">
                {getStepSpecificMessage(currentStep)}
              </Text>
            </VStack>

            {/* Step Information */}
            <HStack spacing={3} justify="center">
              <Badge colorScheme="red" px={3} py={1} rounded="full">
                Step {currentStep}: {stepName}
              </Badge>
              {errorId && (
                <Badge colorScheme="gray" px={3} py={1} rounded="full" fontSize="xs">
                  ID: {errorId.slice(-8)}
                </Badge>
              )}
            </HStack>
          </VStack>

          <Divider />

          {/* Progress Preservation Message */}
          <Alert status="info" rounded="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Your Progress is Safe</AlertTitle>
              <AlertDescription>
                Don't worry! Your progress has been automatically saved. You can continue from where you left off.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Recovery Suggestions */}
          {recoverySuggestions.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={3} color="gray.700">
                Suggested Solutions:
              </Text>
              <List spacing={2}>
                {recoverySuggestions.map((suggestion, index) => (
                  <ListItem key={index}>
                    <HStack align="start" spacing={2}>
                      <ListIcon 
                        as={suggestion.type === 'warning' ? AlertCircle : Info} 
                        color={suggestion.type === 'warning' ? 'orange.500' : 'blue.500'} 
                      />
                      <Text fontSize="sm" color="gray.600">
                        {suggestion.message}
                      </Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Recovery State Information */}
          {recoveryState && (
            <Alert 
              status={recoveryState.isRecovering ? 'info' : 'warning'} 
              rounded="lg"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {recoveryState.isRecovering ? 'Attempting Recovery...' : 'Recovery Available'}
                </AlertTitle>
                <AlertDescription>
                  {recoveryState.isRecovering 
                    ? 'Please wait while we attempt to resolve the issue.'
                    : `Recovery attempts: ${errorState?.recoveryAttempts || 0}/${recoveryState.maxRetryAttempts}`
                  }
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Action Buttons */}
          <VStack spacing={4} pt={4}>
            <Button
              leftIcon={<Icon as={RefreshCw} />}
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handleRetry}
              isLoading={recoveryState?.isRecovering}
              loadingText="Attempting Recovery..."
              isDisabled={recoveryState?.recoveryAttempts >= recoveryState?.maxRetryAttempts}
            >
              Try Again
            </Button>

            <HStack spacing={4} width="full">
              <Button
                leftIcon={<Icon as={ArrowLeft} />}
                variant="outline"
                flex={1}
                onClick={handleReturnToDashboard}
              >
                Return to Dashboard
              </Button>
              
              <Button
                leftIcon={<Icon as={Plus} />}
                variant="outline"
                flex={1}
                onClick={handleStartNewDeal}
              >
                Start New Deal
              </Button>
            </HStack>

            <Button
              leftIcon={<Icon as={Home} />}
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
            >
              Go Home
            </Button>
          </VStack>

          {/* Technical Details (Development Only) */}
          {showDetails && error && (
            <Box mt={6} p={4} bg="gray.50" rounded="lg">
              <Text fontWeight="semibold" mb={2} color="gray.700">
                Technical Details:
              </Text>
              <Text fontSize="sm" color="gray.600" fontFamily="mono">
                {error.message}
              </Text>
              {error.stack && (
                <Text fontSize="xs" color="gray.500" mt={2} fontFamily="mono">
                  {error.stack}
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default DealWizardErrorFallback; 