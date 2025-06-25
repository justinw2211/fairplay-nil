// frontend/src/pages/DealWizard/DealWizardLayout.jsx
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Flex, IconButton, Progress, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const steps = [
  { path: '/dashboard/new-deal/step-1', title: 'The Basics' },
  { path: '/dashboard/new-deal/step-2', title: 'Compensation' },
  { path: '/dashboard/new-deal/step-3', title: 'The Rules' },
  { path: '/dashboard/new-deal/step-4', title: 'The Agreement' },
];

const DealWizardLayout = () => {
  const location = useLocation();
  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);
  const progressPercent = currentStepIndex >= 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <Box bg="brand.backgroundLight" minH="100vh">
      <Container maxW="container.md" py={{ base: '8', md: '12' }}>
        <Flex direction="column" gap={6}>
          <Flex align="center" gap={4}>
            <IconButton
              as={RouterLink}
              to="/dashboard"
              aria-label="Back to Dashboard"
              icon={<ArrowBackIcon />}
              variant="outline"
              colorScheme="gray"
              isRound
            />
            <Box flex="1">
              <Heading as="h1" size="lg" color="brand.textPrimary">
                New Deal Compliance Check
              </Heading>
              <Text color="brand.textSecondary" fontSize="sm">
                Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
              </Text>
            </Box>
          </Flex>
          
          <Progress 
            value={progressPercent} 
            size="sm" 
            colorScheme="pink" // Using pink to match the accent color family
            bg="brand.accentSecondary"
            borderRadius="md" 
          />

          <Box bg="brand.background" p={{ base: 6, md: 8 }} borderRadius="xl" boxShadow="md">
            {/* The current step component will be rendered here */}
            <Outlet />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default DealWizardLayout;