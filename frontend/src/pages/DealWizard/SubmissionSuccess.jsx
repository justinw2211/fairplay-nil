// frontend/src/pages/DealWizard/SubmissionSuccess.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Mail,
  Bell,
  Home,
} from 'lucide-react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const { currentDeal } = useDeal();

  const nextSteps = [
    {
      icon: Clock,
      title: "Review Process",
      description: "Our compliance team will review your submission within 2-3 business days."
    },
    {
      icon: Mail,
      title: "Email Updates",
      description: "You'll receive email notifications about the status of your deal."
    },
    {
      icon: Bell,
      title: "Status Updates",
      description: "Check your dashboard anytime to see the current status of your deal."
    }
  ];

  return (
    <DealWizardStepWrapper stepNumber={11} stepName="Submission Success">
      <Container maxW="3xl" py={12}>
        <Card
          variant="outline"
          borderColor="brand.accentSecondary"
          shadow="lg"
          bg="white"
          rounded="xl"
          overflow="hidden"
        >
          <CardBody p={0}>
            {/* Success Banner */}
            <Box
              bg="brand.accentPrimary"
              py={10}
              px={8}
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              {/* Background Pattern */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={0.1}
                bg="repeating-linear-gradient(
                  45deg,
                  white,
                  white 10px,
                  transparent 10px,
                  transparent 20px
                )"
              />

              {/* Content */}
              <Box position="relative">
                <Flex
                  w={16}
                  h={16}
                  bg="white"
                  rounded="full"
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={6}
                >
                  <Icon as={CheckCircle} w={8} h={8} color="brand.accentPrimary" />
                </Flex>
                <Heading color="white" size="xl" mb={4}>
                  Submission Successful!
                </Heading>
                <Text fontSize="lg" color="white" opacity={0.9}>
                  Your deal has been submitted for review
                </Text>
              </Box>
            </Box>

            {/* Deal Summary */}
            <Box px={8} py={6}>
              <VStack spacing={6} align="stretch">
                {/* Reference Number */}
                <Box textAlign="center">
                  <Text color="brand.textSecondary" fontSize="sm">
                    Reference Number
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="brand.textPrimary"
                    letterSpacing="wide"
                  >
                    {dealId}
                  </Text>
                </Box>

                <Divider />

                {/* Next Steps */}
                <Box>
                  <Heading size="md" mb={4} color="brand.textPrimary">
                    What happens next?
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    {nextSteps.map((step, index) => (
                      <HStack key={index} spacing={4}>
                        <Flex
                          w={10}
                          h={10}
                          bg="brand.backgroundLight"
                          rounded="lg"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Icon as={step.icon} w={5} h={5} color="brand.accentPrimary" />
                        </Flex>
                        <Box>
                          <Text fontWeight="semibold" color="brand.textPrimary">
                            {step.title}
                          </Text>
                          <Text fontSize="sm" color="brand.textSecondary">
                            {step.description}
                          </Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Actions */}
                <VStack spacing={4}>
                  <Button
                    leftIcon={<Icon as={Home} />}
                    rightIcon={<Icon as={ArrowRight} />}
                    onClick={() => navigate('/dashboard')}
                    bg="brand.accentPrimary"
                    color="white"
                    size="lg"
                    width="full"
                    py={7}
                    _hover={{
                      bg: "brand.accentPrimaryHover",
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                    You can track the status of your deal and submit new deals from your dashboard
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default SubmissionSuccess;