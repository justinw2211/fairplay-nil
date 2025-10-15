import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useDealPredictions } from '../../hooks/useDealPredictions';
import predictValuation from '../../components/PredictionEngines/ValuationPredictor';
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
  TrendingUp,
  Users,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  BarChart3,
  Target,
  Edit,
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

const SectionCard = ({ title, icon: IconComponent, children, onEdit }) => (
  <Card variant="outline" borderColor="brand.accentSecondary" shadow="sm">
    <CardHeader borderBottom="1px" borderColor="brand.accentSecondary" bg="brand.backgroundLight" roundedTop="lg">
      <HStack spacing={3} justify="space-between">
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
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            leftIcon={<Icon as={Edit} />}
            color="brand.textSecondary"
            _hover={{ color: "brand.textPrimary" }}
          >
            Edit
          </Button>
        )}
      </HStack>
    </CardHeader>
    <CardBody bg="white">{children}</CardBody>
  </Card>
);

const ValuationWizard = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'valuation';
  const navigate = useNavigate();
  const toast = useToast();
  const { currentDeal, fetchDealById, updateDeal } = useDeal();
  const { saveValuationPrediction } = useDealPredictions(dealId);
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

  const handleRunValuation = async () => {
    console.log('🔍 Starting valuation prediction...');
    console.log('Deal data:', currentDeal);
    console.log('Deal ID:', dealId);
    console.log('predictValuation function:', typeof predictValuation);

    setIsCalculating(true);
    setShowPredictionProcess(true);

    try {
      // Simulate valuation analysis process with realistic delays
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Prepare athlete data for valuation (would come from user profile in real app)
      const athleteData = {
        instagram_followers: currentDeal.athlete_instagram_followers || 0,
        tiktok_followers: currentDeal.athlete_tiktok_followers || 0,
        twitter_followers: currentDeal.athlete_twitter_followers || 0,
        university: currentDeal.athlete_university || currentDeal.deal_school,
        sports: currentDeal.athlete_sports || ['football'], // Default for demo
        gender: currentDeal.athlete_gender || 'male',
        athletic_performance: currentDeal.athlete_performance || null,
        achievements: currentDeal.athlete_achievements || []
      };

      console.log('📊 Running valuation prediction with data:', { currentDeal, athleteData });

      // Run the valuation prediction
      const prediction = predictValuation(currentDeal, athleteData);

      console.log('✅ Valuation result:', prediction);

      // Store prediction in deal record
      const updateData = {
        valuation_prediction: prediction,
        prediction_calculated_at: new Date().toISOString()
      };

      console.log('💾 Updating deal with valuation data...');
      await updateDeal(dealId, updateData);

      console.log('💾 Saving valuation via hook...');
      // Store prediction via API for future reference
      await saveValuationPrediction(prediction);

      console.log('🎯 Navigating to results page...');
      // Navigate to results page
      navigate(`/valuation-result/${dealId}?type=${dealType}`);

    } catch (error) {
      console.error('❌ Error running valuation prediction:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: 'Valuation Error',
        description: `Unable to calculate fair market value: ${error.message}`,
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
              Fair Market Value Analysis
            </Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Calculating your deal's fair market value based on industry data...
            </Text>
          </Box>

          <Card w="full" variant="outline" borderColor="brand.accentSecondary">
            <CardBody>
              <VStack spacing={6}>
                <Box textAlign="center">
                  <Spinner size="xl" color="brand.accentPrimary" thickness="4px" />
                  <Text mt={4} color="brand.textSecondary">Analyzing market factors...</Text>
                </Box>

                <Progress
                  value={85}
                  size="lg"
                  colorScheme="green"
                  bg="brand.backgroundLight"
                  rounded="full"
                  w="full"
                />

                <VStack spacing={3} align="stretch" w="full">
                  <HStack>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color="brand.textSecondary">Social media follower analysis complete</Text>
                  </HStack>
                  <HStack>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color="brand.textSecondary">School tier and conference evaluation complete</Text>
                  </HStack>
                  <HStack>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color="brand.textSecondary">Sport popularity assessment complete</Text>
                  </HStack>
                  <HStack>
                    <Spinner size="sm" color="brand.accentPrimary" />
                    <Text color="brand.textSecondary">Calculating final compensation range...</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Text color="brand.textSecondary" fontSize="sm" textAlign="center">
            This analysis uses real NIL market data from On3, Opendorse, and industry reports
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <DealWizardStepWrapper stepNumber={9} stepName="Valuation Prediction">
      <Container maxW="4xl" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box textAlign="center">
            <Heading size="xl" color="brand.textPrimary" mb={2}>
              Deal Valuation Analysis
            </Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Get fair market value recommendations for your NIL deal
            </Text>
          </Box>

          {/* Deal Summary Card */}
          <Card variant="outline" borderColor="brand.accentSecondary" shadow="lg">
            <CardHeader bg="brand.backgroundLight" borderBottom="1px" borderColor="brand.accentSecondary">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Heading size="md" color="brand.textPrimary">
                    {currentDeal.deal_nickname || 'Deal Summary'}
                  </Heading>
                  <HStack>
                    <StatusBadge status={currentDeal.status} />
                    <Text color="brand.textSecondary" fontSize="sm">
                      Created {new Date(currentDeal.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                </VStack>
                <VStack align="end" spacing={1}>
                  <Text color="brand.textSecondary" fontSize="sm">Current Compensation</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                    {formatCurrency(getTotalCompensation())}
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <SectionCard 
                  title="Deal Terms" 
                  icon={Briefcase}
                  onEdit={() => navigate(`/add/deal/terms/${dealId}?type=${dealType}`)}
                >
                  <VStack align="start" spacing={2}>
                    <Text><strong>Type:</strong> {currentDeal.deal_type || 'Standard Deal'}</Text>
                    <Text><strong>Activities:</strong> {currentDeal.activities?.join(', ') || 'Not specified'}</Text>
                    <Text><strong>Duration:</strong> {currentDeal.start_date && currentDeal.end_date ?
                      `${new Date(currentDeal.start_date).toLocaleDateString()} - ${new Date(currentDeal.end_date).toLocaleDateString()}` :
                      'Not specified'}</Text>
                  </VStack>
                </SectionCard>

                <SectionCard 
                  title="Payor Information" 
                  icon={Users}
                  onEdit={() => navigate(`/add/deal/payor/${dealId}?type=${dealType}`)}
                >
                  <VStack align="start" spacing={2}>
                    <Text><strong>Company:</strong> {currentDeal.payor_name || 'Not specified'}</Text>
                    <Text><strong>Type:</strong> {currentDeal.payor_type || 'Not specified'}</Text>
                    <Text><strong>Industry:</strong> {currentDeal.payor_industry || 'Not specified'}</Text>
                  </VStack>
                </SectionCard>

                <SectionCard 
                  title="Deliverables" 
                  icon={Target}
                  onEdit={() => navigate(`/add/deal/activities/select/${dealId}?type=${dealType}`)}
                >
                  <VStack align="start" spacing={2}>
                    <Text><strong>Posts:</strong> {currentDeal.social_media_posts || 0} posts</Text>
                    <Text><strong>Platforms:</strong> {currentDeal.platforms?.join(', ') || 'Not specified'}</Text>
                    <Text><strong>Timeline:</strong> {currentDeal.deliverable_timeline || 'Not specified'}</Text>
                  </VStack>
                </SectionCard>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>

        {/* Analysis Info */}
        <Card variant="outline" borderColor="blue.200" bg="blue.50" mb={8}>
          <CardBody>
            <HStack spacing={4}>
              <Icon as={BarChart3} color="blue.500" boxSize={6} />
              <Box flex={1}>
                <Heading size="sm" color="blue.700" mb={2}>
                  What is Fair Market Value Analysis?
                </Heading>
                <Text color="blue.600" fontSize="sm">
                  Our valuation engine analyzes your deal using real NIL market data to determine if your compensation
                  is fair compared to similar deals. We consider social media following, school tier, sport popularity,
                  activity type, and current market trends to provide accurate compensation recommendations.
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Analysis Factors Preview */}
        <Card variant="outline" borderColor="brand.accentSecondary" mb={8}>
          <CardHeader>
            <Heading size="md" color="brand.textPrimary">Analysis Factors</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={Users} color="brand.accentPrimary" />
                  <Text fontWeight="medium">Social Media Reach</Text>
                </HStack>
                <HStack>
                  <Icon as={TrendingUp} color="brand.accentPrimary" />
                  <Text fontWeight="medium">School Tier & Conference</Text>
                </HStack>
                <HStack>
                  <Icon as={Zap} color="brand.accentPrimary" />
                  <Text fontWeight="medium">Sport Popularity</Text>
                </HStack>
              </VStack>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={Briefcase} color="brand.accentPrimary" />
                  <Text fontWeight="medium">Activity Type Value</Text>
                </HStack>
                <HStack>
                  <Icon as={BarChart3} color="brand.accentPrimary" />
                  <Text fontWeight="medium">Market Trends</Text>
                </HStack>
                <HStack>
                  <Icon as={Target} color="brand.accentPrimary" />
                  <Text fontWeight="medium">Deal Complexity</Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Flex justify="space-between" align="center">
          <Button
            leftIcon={<ChevronLeft />}
            variant="outline"
            onClick={() => navigate(`/add/deal/deal-type/${dealId}?type=${dealType}`)}
            borderColor="brand.accentSecondary"
            color="brand.textPrimary"
          >
            Back to Deal Type
          </Button>

          <Button
            rightIcon={<BarChart3 />}
            bg="brand.accentPrimary"
            color="white"
            size="lg"
            onClick={handleRunValuation}
            isLoading={isCalculating}
            loadingText="Analyzing..."
            _hover={{ bg: 'brand.accentPrimary', opacity: 0.9 }}
          >
            Calculate Fair Market Value
          </Button>
        </Flex>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default ValuationWizard;