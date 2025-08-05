// frontend/src/pages/DealWizard/DealWizardLayout.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { Box, Button, Container, Flex, Heading, Text, Spinner, VStack } from '@chakra-ui/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import DealWizardErrorFallback from '../../components/DealWizardErrorFallback';

const DealWizardLayoutContent = ({ children, title, instructions, onContinue, isContinueDisabled = false, currentStep = 0 }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, fetchDealById, loading } = useDeal();

  // This effect ensures that if a user navigates directly to a wizard step URL,
  // we fetch the correct deal data to populate the form.
  useEffect(() => {
    // Only fetch if there's a dealId in the URL and it doesn't match the deal in context
    if (dealId && deal?.id?.toString() !== dealId) {
      console.log('[DealWizardLayout] Deal ID mismatch detected:', {
        urlDealId: dealId,
        contextDealId: deal?.id,
        willFetch: true
      });
      fetchDealById(dealId);
    } else {
      console.log('[DealWizardLayout] Deal ID check:', {
        urlDealId: dealId,
        contextDealId: deal?.id,
        willFetch: false
      });
    }
  }, [dealId, deal, fetchDealById]);

  // This handles the "Save and Exit" functionality.
  const handleSaveAndExit = () => {
    // The deal is already saved on each step, so we just navigate to the dashboard.
    navigate('/dashboard');
  };

  // While fetching the initial deal data, show a loading spinner.
  if (loading && !deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="lg" color="brand.textPrimary">{title}</Heading>
          {instructions && <Text mt={2} color="brand.textSecondary">{instructions}</Text>}
        </Box>

        {/* The content for the specific wizard step is rendered here */}
        <Box minH="300px">
          {children}
        </Box>

        {/* Navigation buttons */}
        <Flex justify="space-between" align="center" borderTop="1px" borderColor="gray.200" pt={6}>
          <Button variant="link" onClick={handleSaveAndExit}>
            Save and Exit
          </Button>
          <Button
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            onClick={onContinue}
            isLoading={loading}
            isDisabled={isContinueDisabled || loading}
            _hover={{ bg: '#c8aeb0' }}
          >
            Continue
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

const DealWizardLayout = (props) => {
  // Extract currentStep from props or determine from URL
  const { dealId } = useParams();
  const currentStep = props.currentStep || 0;

  return (
    <ErrorBoundary
      context="DealWizard"
      fallbackRender={(fallbackProps) => (
        <DealWizardErrorFallback
          {...fallbackProps}
          currentStep={currentStep}
          onRetry={() => window.location.reload()}
        />
      )}
    >
      <DealWizardLayoutContent {...props} currentStep={currentStep} />
    </ErrorBoundary>
  );
};

export default DealWizardLayout;