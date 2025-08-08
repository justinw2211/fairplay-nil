import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useDealPredictions } from '../../hooks/useDealPredictions';
import predictClearinghouse from '../../components/PredictionEngines/ClearinghousePredictor';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Spinner,
  VStack,
  HStack,
  Divider,
  SimpleGrid,
  Tag,
  List,
  ListItem,
  Icon,
  useToast,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  CheckCircle,
  DollarSign,
  Calendar,
  Shield,
  Users,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
} from 'lucide-react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatusBadge = ({ status }) => {
  const statusProps = {
    draft: { colorScheme: 'gray', label: 'Draft' },
    submitted: { colorScheme: 'yellow', label: 'Under Review' },
    approved: { colorScheme: 'green', label: 'Approved' },
    rejected: { colorScheme: 'red', label: 'Rejected' },
  }[status] || { colorScheme: 'gray', label: 'Draft' };

  return (
    <Badge colorScheme={statusProps.colorScheme} px={3} py={1} rounded="full">
      {statusProps.label}
    </Badge>
  );
};

const SectionCard = ({ title, icon: IconComponent, children }) => (
  <Card variant="outline" borderColor="brand.accentSecondary" shadow="sm">
    <CardHeader borderBottom="1px" borderColor="brand.accentSecondary" bg="brand.backgroundLight" roundedTop="lg">
      <HStack spacing={3}>
        <Box
          bg="brand.accentPrimary"
          p={2}
          rounded="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={IconComponent} color="white" />
        </Box>
        <Heading size="md" color="brand.textPrimary">{title}</Heading>
      </HStack>
    </CardHeader>
    <CardBody bg="white">{children}</CardBody>
  </Card>
);

const ClearinghouseWizard = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'clearinghouse';
  const navigate = useNavigate();
  const toast = useToast();
  const { currentDeal, fetchDealById, updateDeal } = useDeal();
  const { saveClearinghousePrediction } = useDealPredictions(dealId);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showPredictionProcess, setShowPredictionProcess] = useState(false);

  useEffect(() => {
    if (!currentDeal && dealId) {
      fetchDealById(dealId);
    }
  }, [currentDeal, dealId, fetchDealById]);

  if (!currentDeal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const getTotalCompensation = () => {
    let total = 0;

    if (currentDeal.compensation_cash) {
      total += parseFloat(currentDeal.compensation_cash) || 0;
    }

    if (currentDeal.compensation_goods && Array.isArray(currentDeal.compensation_goods)) {
      total += currentDeal.compensation_goods.reduce((sum, item) => {
        return sum + (parseFloat(item.estimated_value) || 0);
      }, 0);
    }

    if (currentDeal.compensation_other && Array.isArray(currentDeal.compensation_other)) {
      total += currentDeal.compensation_other.reduce((sum, item) => {
        return sum + (parseFloat(item.estimated_value) || 0);
      }, 0);
    }

    return total;
  };

  const handleRunPrediction = async () => {
    console.log('🔍 Starting clearinghouse prediction...');
    console.log('Deal data:', currentDeal);
    console.log('Deal ID:', dealId);
    console.log('predictClearinghouse function:', typeof predictClearinghouse);

    setIsCalculating(true);
    setShowPredictionProcess(true);

    try {
      // Simulate prediction process with realistic delays
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📊 Running clearinghouse prediction with data:', { currentDeal });

      // Run the clearinghouse prediction
      const prediction = predictClearinghouse(currentDeal, currentDeal);

      console.log('✅ Prediction result:', prediction);

      // Store prediction in deal record
      const updateData = {
        clearinghouse_prediction: prediction,
        prediction_calculated_at: new Date().toISOString()
      };

      console.log('💾 Updating deal with prediction data...');
      await updateDeal(dealId, updateData);

      console.log('💾 Saving prediction via hook...');
      // Store prediction via API for future reference
      await saveClearinghousePrediction(prediction);

      console.log('🎯 Navigating to results page...');
      // Navigate to results page
      navigate(`/clearinghouse-result/${dealId}?type=${dealType}`);

    } catch (error) {
      console.error('❌ Error running clearinghouse prediction:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: 'Prediction Error',
        description: `Unable to calculate clearinghouse prediction: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsCalculating(false);
      setShowPredictionProcess(false);
    }
  };

  if (showPredictionProcess) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={8} align="center">
          <Box textAlign="center">
            <Heading size="lg" color="brand.textPrimary" mb={4}>
              NIL Go Clearinghouse Analysis
            </Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Running your deal through the Deloitte clearinghouse process...
            </Text>
          </Box>

          <Card w="full" variant="outline" borderColor="brand.accentSecondary">
            <CardBody>
              <VStack spacing={6}>
                <Box textAlign="center">
                  <Spinner size="xl" color="brand.accentPrimary" thickness="4px" />
                  <Text mt={4} fontWeight="medium" color="brand.textPrimary">
                    Analyzing Deal Parameters
                  </Text>
                </Box>

                <VStack spacing={4} w="full">
                  <HStack justify="space-between" w="full">
                    <HStack>
                      <Icon as={CheckCircle} color="green.500" />
                      <Text color="brand.textSecondary">Threshold Analysis ($600+)</Text>
                    </HStack>
                    <Text color="green.500" fontWeight="medium">Complete</Text>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <HStack>
                      <Spinner size="sm" color="blue.500" />
                      <Text color="brand.textSecondary">Payor Association Verification</Text>
                    </HStack>
                    <Text color="blue.500" fontWeight="medium">In Progress</Text>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <HStack>
                      <Icon as={Clock} color="gray.400" />
                      <Text color="gray.400">Business Purpose Verification</Text>
                    </HStack>
                    <Text color="gray.400">Pending</Text>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <HStack>
                      <Icon as={Clock} color="gray.400" />
                      <Text color="gray.400">Fair Market Value Analysis</Text>
                    </HStack>
                    <Text color="gray.400">Pending</Text>
                  </HStack>
                </VStack>

                <Alert status="info" rounded="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Processing Your Deal</AlertTitle>
                    <AlertDescription>
                      This analysis typically takes 2-3 business days in the real NIL Go system.
                      Our prediction gives you an estimate of the likely outcome.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    );
  }

  return (
    <DealWizardStepWrapper stepNumber={9} stepName="Clearinghouse Prediction">
      <Container maxW="4xl" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box>
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">
                  Final Review - Clearinghouse
                </Text>
                <Text color="brand.textSecondary">
                  Ready for Prediction
                </Text>
              </Flex>
              <Progress
                value={100}
                w="full"
                h="2"
                bg="brand.accentSecondary"
                sx={{
                  '& > div': {
                    bg: 'brand.accentPrimary',
                    transition: 'width 0.5s ease-out'
                  }
                }}
                rounded="full"
              />
            </VStack>

            <Flex justify="space-between" align="center" mb={2}>
              <Heading size="lg" color="brand.textPrimary">NIL Go Clearinghouse Review</Heading>
              <StatusBadge status={currentDeal.status} />
            </Flex>
            <Text color="brand.textSecondary">
              Your deal is ready for NIL Go clearinghouse analysis. Review the details below and run the prediction.
            </Text>
          </Box>

          <Alert status="info" rounded="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>About NIL Go Clearinghouse</AlertTitle>
              <AlertDescription>
                This prediction simulates Deloitte's NIL Go clearinghouse process, which evaluates deals over $600
                using a 3-step analysis: Payor Association, Business Purpose, and Fair Market Value assessment.
              </AlertDescription>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <SectionCard title="Deal Overview" icon={Briefcase}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Total Compensation</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                    {formatCurrency(getTotalCompensation())}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Deal Nickname</Text>
                  <Text color="brand.textPrimary">{currentDeal.deal_nickname || 'Untitled Deal'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Deal Type</Text>
                  <Tag colorScheme="blue" size="sm">NIL Go Clearinghouse</Tag>
                </Box>
              </VStack>
            </SectionCard>

            <SectionCard title="Payor Information" icon={Users}>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Payor Name</Text>
                  <Text color="brand.textPrimary">{currentDeal.payor_name || 'Not specified'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Payor Type</Text>
                  <Text color="brand.textPrimary">{currentDeal.payor_type || 'Not specified'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Contact</Text>
                  <Text color="brand.textPrimary">{currentDeal.contact_name || 'Not specified'}</Text>
                </Box>
              </VStack>
            </SectionCard>
          </SimpleGrid>

          <Accordion allowToggle>
            <AccordionItem border="none" mb={4}>
              <AccordionButton
                bg="brand.backgroundLight"
                _hover={{ bg: 'brand.backgroundLight' }}
                rounded="lg"
                p={4}
              >
                <HStack flex="1">
                  <Icon as={Calendar} />
                  <Text fontWeight="semibold">Activities & Requirements</Text>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                {currentDeal.activities && currentDeal.activities.length > 0 ? (
                  <List spacing={3}>
                    {currentDeal.activities.map((activity, index) => (
                      <ListItem key={index}>
                        <HStack align="start">
                          <Icon as={CheckCircle} color="green.500" mt={1} />
                          <Box>
                            <Text fontWeight="semibold" color="brand.textPrimary">
                              {activity.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                            <Text color="brand.textSecondary">
                              {activity.details?.description || 'Activity details provided'}
                            </Text>
                          </Box>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="brand.textSecondary">No activities specified</Text>
                )}
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none">
              <AccordionButton
                bg="brand.backgroundLight"
                _hover={{ bg: 'brand.backgroundLight' }}
                rounded="lg"
                p={4}
              >
                <HStack flex="1">
                  <Icon as={Shield} />
                  <Text fontWeight="semibold">Compliance Factors</Text>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <List spacing={3}>
                  <ListItem>
                    <HStack align="start">
                      <Icon
                        as={currentDeal.uses_school_ip ? AlertCircle : CheckCircle}
                        color={currentDeal.uses_school_ip ? "orange.500" : "green.500"}
                        mt={1}
                      />
                      <Box>
                        <Text fontWeight="semibold" color="brand.textPrimary">School IP Usage</Text>
                        <Text color="brand.textSecondary">
                          {currentDeal.uses_school_ip ? 'Uses school intellectual property' : 'No school IP used'}
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                  <ListItem>
                    <HStack align="start">
                      <Icon
                        as={currentDeal.grant_exclusivity === 'yes' ? AlertCircle : CheckCircle}
                        color={currentDeal.grant_exclusivity === 'yes' ? "orange.500" : "green.500"}
                        mt={1}
                      />
                      <Box>
                        <Text fontWeight="semibold" color="brand.textPrimary">Exclusivity Terms</Text>
                        <Text color="brand.textSecondary">
                          {currentDeal.grant_exclusivity === 'yes' ? 'Exclusive representation required' : 'Non-exclusive arrangement'}
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {/* Navigation Buttons */}
          <Flex justify="space-between" pt={8} w="full">
            <Button
              leftIcon={<Icon as={ChevronLeft} />}
              variant="ghost"
              color="brand.textSecondary"
              px={8}
              py={3}
              h={12}
              fontSize="base"
              fontWeight="medium"
              onClick={() => navigate(`/add/deal/compensation/${dealId}?type=${dealType}`)}
              _hover={{
                bg: "brand.backgroundLight",
                color: "brand.textPrimary",
              }}
            >
              Back to Wizard
            </Button>

            <Flex gap={4}>
              <Button
                variant="ghost"
                color="brand.textSecondary"
                px={8}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="medium"
                onClick={() => navigate('/dashboard')}
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Save as Draft
              </Button>

              <Button
                rightIcon={<Icon as={Zap} />}
                variant="solid"
                bg="brand.accentPrimary"
                color="white"
                px={8}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="semibold"
                onClick={handleRunPrediction}
                isLoading={isCalculating}
                loadingText="Analyzing..."
                transition="all 0.2s"
                _hover={{
                  bg: "brand.accentPrimaryHover",
                }}
              >
                Run NIL Go Prediction
              </Button>
            </Flex>
          </Flex>
        </VStack>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default ClearinghouseWizard;