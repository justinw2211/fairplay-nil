import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
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
  SimpleGrid,
  Icon,
  useToast,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  Home,
  RotateCcw,
  AlertCircle,
  Download,
  Share2,
  BarChart3,
  Target,
  Star,
  Award,
  Zap,
} from 'lucide-react';

const ValuationResult = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'valuation';
  const navigate = useNavigate();
  const toast = useToast();
  const { currentDeal, fetchDealById } = useDeal();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!deal && dealId) {
      fetchDealById(dealId);
    }
  }, [deal, dealId, fetchDealById]);

  useEffect(() => {
    if (currentDeal?.valuation_prediction) {
      console.log('📊 ValuationResult - Setting prediction from deal:', currentDeal.valuation_prediction);
      setPrediction(currentDeal.valuation_prediction);
    }
  }, [currentDeal]);

  console.log('📊 ValuationResult - Current state:', {
    deal: currentDeal ? 'loaded' : 'loading',
    prediction: prediction ? 'available' : 'not available',
    predictionData: prediction,
    predictionKeys: prediction ? Object.keys(prediction) : 'none',
    factorsType: prediction?.factors ? typeof prediction.factors : 'none',
    rationaleType: prediction?.rationale ? typeof prediction.rationale : 'none'
  });

  if (!deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  if (!prediction) {
    return (
      <Container maxW="2xl" py={8}>
        <Alert status="warning" rounded="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>No Valuation Available</AlertTitle>
            <AlertDescription>
              This deal hasn't been analyzed for fair market value yet.
            </AlertDescription>
          </Box>
        </Alert>
        <Button
          mt={4}
          onClick={() => navigate(`/valuation-wizard/${dealId}?type=${dealType}`)}
          bg="brand.accentPrimary"
          color="white"
          _hover={{ bg: 'brand.accentPrimary', opacity: 0.9 }}
        >
          Calculate Fair Market Value
        </Button>
      </Container>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getValuationAssessment = () => {
    const currentCompensation = parseFloat(deal.compensation_cash) || 0;
    const fmv = prediction?.estimated_fmv || 0;

    if (fmv === 0) {
      return {
        status: 'unknown',
        color: 'gray',
        icon: AlertTriangle,
        title: 'Analysis Incomplete',
        description: 'Unable to determine market value assessment.',
        bgColor: 'gray.50',
        borderColor: 'gray.200'
      };
    }

    const difference = ((currentCompensation - fmv) / fmv) * 100;

    if (Math.abs(difference) <= 15) {
      return {
        status: 'fair',
        color: 'green',
        icon: CheckCircle,
        title: 'Fair Market Value',
        description: 'Your compensation is within fair market range.',
        bgColor: 'green.50',
        borderColor: 'green.200'
      };
    } else if (difference > 15) {
      return {
        status: 'overvalued',
        color: 'yellow',
        icon: AlertTriangle,
        title: 'Above Market Value',
        description: 'Your compensation is above typical market rates.',
        bgColor: 'yellow.50',
        borderColor: 'yellow.200'
      };
    } else {
      return {
        status: 'undervalued',
        color: 'red',
        icon: XCircle,
        title: 'Below Market Value',
        description: 'Your compensation may be below fair market value.',
        bgColor: 'red.50',
        borderColor: 'red.200'
      };
    }
  };

  const assessment = getValuationAssessment();

  const handleOptimizeDeal = () => {
    toast({
      title: 'Optimizing Deal',
      description: 'Returning to editor with valuation recommendations.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate(`/add/deal/terms/${dealId}?type=${dealType}&optimize=true`);
  };

  const handleAcceptValuation = () => {
    toast({
      title: 'Valuation Accepted',
      description: 'Your deal has been updated with market recommendations.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/dashboard');
  };

  const handleNegotiate = () => {
    toast({
      title: 'Negotiation Tools',
      description: 'Use the insights below to improve your deal terms.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getFactorScore = (factor) => {
    if (!factor || typeof factor !== 'object') {return 75;}
    if (factor.multiplier && typeof factor.multiplier === 'number') {
      return Math.min(Math.round(factor.multiplier * 75), 100);
    }
    if (factor.score && typeof factor.score === 'number') {
      return Math.min(Math.round(factor.score), 100);
    }
    return 75;
  };

  try {
    console.log('📊 ValuationResult - About to render with prediction:', {
      hasFactors: !!prediction?.factors,
      factorsKeys: prediction?.factors ? Object.keys(prediction.factors) : [],
      hasRationale: !!prediction?.rationale,
      rationaleType: typeof prediction?.rationale,
      hasMarketComparison: !!prediction?.market_comparison,
      hasOptimizationRecs: !!prediction?.optimization_recommendations
    });

    return (
      <Container maxW="5xl" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box textAlign="center">
            <Heading size="xl" color="brand.textPrimary" mb={2}>
              Fair Market Value Analysis
            </Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Deal #{dealId} • {String(deal?.deal_nickname || 'Untitled Deal')}
            </Text>
          </Box>

          {/* Valuation Status Card */}
          <Card
            variant="outline"
            bg={assessment.bgColor}
            borderColor={assessment.borderColor}
            borderWidth="2px"
            shadow="lg"
          >
            <CardHeader>
              <HStack spacing={4}>
                <Box
                  bg={`${assessment.color}.500`}
                  p={3}
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={assessment.icon} color="white" boxSize={6} />
                </Box>
                <Box flex={1}>
                  <Heading size="lg" color={`${assessment.color}.700`} mb={1}>
                    {String(assessment.title)}
                  </Heading>
                  <Text color={`${assessment.color}.600`} fontSize="md">
                    {String(assessment.description)}
                  </Text>
                </Box>
                <VStack align="end" spacing={1}>
                  <Text fontSize="sm" color={`${assessment.color}.600`}>Confidence Score</Text>
                  <CircularProgress
                    value={prediction?.confidence || 0}
                    color={`${assessment.color}.500`}
                    size="60px"
                    thickness="8px"
                  >
                    <CircularProgressLabel
                      fontSize="sm"
                      fontWeight="bold"
                      color={`${assessment.color}.700`}
                    >
                      {prediction?.confidence || 0}%
                    </CircularProgressLabel>
                  </CircularProgress>
                </VStack>
              </HStack>
            </CardHeader>
          </Card>
        </VStack>

        {/* Compensation Analysis */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
          {/* Fair Market Value Range */}
          <Card variant="outline" borderColor="brand.accentSecondary" shadow="lg">
            <CardHeader bg="brand.backgroundLight" borderBottom="1px" borderColor="brand.accentSecondary">
              <HStack>
                <Icon as={DollarSign} color="brand.accentPrimary" boxSize={5} />
                <Heading size="md" color="brand.textPrimary">Fair Market Value</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                  <Text fontSize="sm" color="brand.textSecondary" mb={2}>Estimated FMV</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="brand.textPrimary">
                    {formatCurrency(prediction?.estimated_fmv || 0)}
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontSize="sm" color="brand.textSecondary" mb={3}>Compensation Range</Text>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="brand.textSecondary">Low Range</Text>
                      <Text fontWeight="medium" color="brand.textPrimary">
                        {formatCurrency(prediction?.low_range || 0)}
                      </Text>
                    </HStack>
                    <Progress
                      value={75}
                      size="lg"
                      colorScheme="green"
                      bg="brand.backgroundLight"
                      rounded="full"
                    />
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="brand.textSecondary">High Range</Text>
                      <Text fontWeight="medium" color="brand.textPrimary">
                        {formatCurrency(prediction?.high_range || 0)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box bg="blue.50" p={4} rounded="lg" borderLeft="4px" borderColor="blue.400">
                  <Text fontSize="sm" color="blue.700">
                    <strong>Current Deal:</strong> {formatCurrency(parseFloat(currentDeal.compensation_cash) || 0)}
                  </Text>
                  <Text fontSize="xs" color="blue.600" mt={1}>
                    {prediction?.market_comparison?.position_description || 'Compared to similar deals'}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Factor Breakdown */}
          <Card variant="outline" borderColor="brand.accentSecondary" shadow="lg">
            <CardHeader bg="brand.backgroundLight" borderBottom="1px" borderColor="brand.accentSecondary">
              <HStack>
                <Icon as={BarChart3} color="brand.accentPrimary" boxSize={5} />
                <Heading size="md" color="brand.textPrimary">Valuation Factors</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {prediction?.factors && Object.entries(prediction.factors)
                  .filter(([key]) => key !== 'gender_adjustment')
                  .map(([key, factor]) => (
                  <Box key={key}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="brand.textPrimary">
                        {String(key).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Badge colorScheme={getFactorScore(factor) > 80 ? 'green' : getFactorScore(factor) > 60 ? 'yellow' : 'red'}>
                        {(() => {
                          if (factor?.multiplier && typeof factor.multiplier === 'number') {
                            return `${factor.multiplier}x`;
                          }
                          if (factor?.value && typeof factor.value === 'number') {
                            return formatCurrency(factor.value);
                          }
                          if (factor?.score && typeof factor.score === 'number') {
                            return `${Math.round(factor.score)}%`;
                          }
                          return 'N/A';
                        })()}
                      </Badge>
                    </HStack>
                    <Progress
                      value={getFactorScore(factor)}
                      size="sm"
                      colorScheme={getFactorScore(factor) > 80 ? 'green' : getFactorScore(factor) > 60 ? 'yellow' : 'red'}
                      bg="brand.backgroundLight"
                      rounded="full"
                      mb={1}
                    />
                    <Text fontSize="xs" color="brand.textSecondary">
                      {String(factor?.description || 'No description available')}
                    </Text>
                  </Box>
                ))}
                {(!prediction?.factors || Object.keys(prediction.factors).filter(key => key !== 'gender_adjustment').length === 0) && (
                  <Box p={4} bg="gray.50" rounded="lg" textAlign="center">
                    <Text fontSize="sm" color="brand.textSecondary">
                      No detailed factors available for this valuation.
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Detailed Analysis */}
        <Card variant="outline" borderColor="brand.accentSecondary" shadow="lg" mb={8}>
          <CardHeader bg="brand.backgroundLight" borderBottom="1px" borderColor="brand.accentSecondary">
            <HStack>
              <Icon as={Target} color="brand.accentPrimary" boxSize={5} />
              <Heading size="md" color="brand.textPrimary">Market Analysis & Recommendations</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton _hover={{ bg: 'brand.backgroundLight' }}>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={TrendingUp} color="brand.accentPrimary" />
                      <Text fontWeight="medium">Detailed Rationale</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Box bg="gray.50" p={4} rounded="lg">
                    <Text fontSize="sm" color="brand.textSecondary" whiteSpace="pre-line">
                      {(() => {
                        const rationale = prediction?.rationale;
                        if (!rationale) {return 'No detailed rationale available.';}
                        if (typeof rationale === 'string') {return rationale;}
                        if (typeof rationale === 'object') {
                          // Convert object to readable string
                          return Object.entries(rationale)
                            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                            .join('\n');
                        }
                        return String(rationale);
                      })()}
                    </Text>
                  </Box>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="none">
                <AccordionButton _hover={{ bg: 'brand.backgroundLight' }}>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={Users} color="brand.accentPrimary" />
                      <Text fontWeight="medium">Market Comparison</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack spacing={3} align="stretch">
                    {prediction?.market_comparison?.comparisons?.map((comp, index) => (
                      <Box key={index} p={3} bg="blue.50" rounded="lg">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="medium" color="blue.700">
                            {String(comp?.category || 'Unknown Category')}
                          </Text>
                          <Text fontSize="sm" color="blue.600">
                            {comp?.average_value && typeof comp.average_value === 'number' ?
                              formatCurrency(comp.average_value) : 'N/A'}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="blue.600" mt={1}>
                          {String(comp?.description || 'No description available')}
                        </Text>
                      </Box>
                    )) || (
                      <Text fontSize="sm" color="brand.textSecondary">
                        {String(prediction?.market_comparison?.overall_assessment || 'Market comparison data not available')}
                      </Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="none">
                <AccordionButton _hover={{ bg: 'brand.backgroundLight' }}>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={Award} color="brand.accentPrimary" />
                      <Text fontWeight="medium">Optimization Recommendations</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack spacing={3} align="stretch">
                    {prediction?.optimization_recommendations?.map((rec, index) => (
                      <Box key={index} p={3} bg="green.50" rounded="lg" borderLeft="3px" borderColor="green.400">
                        <Text fontSize="sm" fontWeight="medium" color="green.700" mb={1}>
                          {String(rec?.title || 'Recommendation')}
                        </Text>
                        <Text fontSize="xs" color="green.600">
                          {String(rec?.description || 'No description available')}
                        </Text>
                        {rec?.potential_increase && typeof rec.potential_increase === 'number' && (
                          <Text fontSize="xs" color="green.500" mt={1} fontWeight="medium">
                            Potential increase: {formatCurrency(rec.potential_increase)}
                          </Text>
                        )}
                      </Box>
                    )) || (
                      <Box p={3} bg="green.50" rounded="lg">
                        <Text fontSize="sm" color="green.700">
                          Your deal appears to be well-structured for current market conditions.
                          Consider leveraging your social media growth and athletic performance for future negotiations.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4} justify="center" wrap="wrap">
          <Button
            leftIcon={<ChevronLeft />}
            variant="outline"
            onClick={() => navigate('/dashboard')}
            borderColor="brand.accentSecondary"
            color="brand.textPrimary"
          >
            Back to Dashboard
          </Button>

          <Button
            leftIcon={<RotateCcw />}
            colorScheme="yellow"
            onClick={handleOptimizeDeal}
          >
            Optimize Deal
          </Button>

          <Button
            leftIcon={<Target />}
            colorScheme="blue"
            onClick={handleNegotiate}
          >
            Negotiation Tips
          </Button>

          <Button
            leftIcon={<CheckCircle />}
            bg="brand.accentPrimary"
            color="white"
            onClick={handleAcceptValuation}
            _hover={{ bg: 'brand.accentPrimary', opacity: 0.9 }}
          >
            Accept Valuation
          </Button>
        </HStack>

        {/* Additional Info */}
        <Box mt={8} textAlign="center">
          <Text fontSize="xs" color="brand.textSecondary">
            Analysis completed on {new Date(deal.prediction_calculated_at || Date.now()).toLocaleString()} •
            Based on industry data from On3, Opendorse, and NIL market research
          </Text>
        </Box>
      </Container>
    );
  } catch (error) {
    console.error('❌ ValuationResult rendering error:', error);

    return (
      <Container maxW="2xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Rendering Error</AlertTitle>
            <AlertDescription>
              There was an error displaying the valuation results.
              Error: {error.message}
            </AlertDescription>
          </Box>
        </Alert>
        <Button
          mt={4}
          onClick={() => navigate('/dashboard')}
          bg="brand.accentPrimary"
          color="white"
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }
};

export default ValuationResult;