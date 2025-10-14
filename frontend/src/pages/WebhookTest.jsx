import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

/**
 * Webhook Test Page
 * This page triggers a real Sentry error to test the webhook integration
 */
export default function WebhookTest() {
  const [errorTriggered, setErrorTriggered] = useState(false);

  const triggerSentryError = () => {
    setErrorTriggered(true);
    
    // Wait a moment for UI to update, then throw error
    setTimeout(() => {
      throw new Error('WEBHOOK TEST: This is a test error to verify Sentry webhook integration');
    }, 100);
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} p={6}>
      <VStack spacing={6} align="stretch">
        <Heading>Sentry Webhook Test</Heading>
        
        <Text>
          This page will trigger a real error that gets sent to Sentry.
          Use this to verify the webhook integration works end-to-end.
        </Text>

        <Box p={4} bg="yellow.50" borderRadius="md" borderWidth={1} borderColor="yellow.200">
          <Text fontWeight="bold" mb={2}>Test Instructions:</Text>
          <Text fontSize="sm">
            1. Make sure you're on a preview deployment (not localhost)<br/>
            2. Click the button below to trigger an error<br/>
            3. Check your PR for a Sentry error comment (may take 10-30 seconds)<br/>
            4. Verify the comment shows the error details
          </Text>
        </Box>

        <Button
          colorScheme="red"
          size="lg"
          onClick={triggerSentryError}
          isDisabled={errorTriggered}
        >
          {errorTriggered ? 'Error Triggered! Check Sentry...' : 'Trigger Test Error'}
        </Button>

        {errorTriggered && (
          <Box p={4} bg="blue.50" borderRadius="md" borderWidth={1} borderColor="blue.200">
            <Text fontWeight="bold" color="blue.700">
              ✅ Error triggered! Now:
            </Text>
            <Text fontSize="sm" mt={2}>
              1. Check Sentry dashboard for the error<br/>
              2. Wait 10-30 seconds for webhook to process<br/>
              3. Refresh your PR to see the sticky comment<br/>
              4. The comment should show: "WEBHOOK TEST: This is a test error..."
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

