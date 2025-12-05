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
  RotateCcw,
  AlertCircle,
  Download,
  Share2,
} from 'lucide-react';

const ClearinghouseResult = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'clearinghouse';
  const navigate = useNavigate();
  const toast = useToast();
  const { currentDeal, fetchDealById } = useDeal();
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!currentDeal && dealId) {
      fetchDealById(dealId);
    }
  }, [currentDeal, dealId, fetchDealById]);

  useEffect(() => {
    if (currentDeal?.clearinghouse_prediction) {
      setPrediction(currentDeal.clearinghouse_prediction);
    }
  }, [currentDeal]);

  if (!currentDeal) {
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
            <AlertTitle>No Prediction Available</AlertTitle>
            <AlertDescription>
              This deal hasn't been analyzed by the clearinghouse prediction engine yet.
            </AlertDescription>
          </Box>
        </Alert>
        <Button
          mt={4}
          onClick={() => navigate(`/clearinghouse-wizard/${dealId}?type=${dealType}`)}
          colorScheme="blue"
        >
          Run Prediction
        </Button>
      </Container>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      cleared: {
        color: 'green',
        icon: CheckCircle,
        title: 'Deal Cleared',
        description: 'Your deal meets NIL Go clearinghouse requirements and is likely to be approved.',
        bgColor: 'green.50',
        borderColor: 'green.200'
      },
      in_review: {
        color: 'yellow',
        icon: AlertTriangle,
        title: 'Additional Review Required',
        description: 'Your deal requires further documentation or clarification before approval.',
        bgColor: 'yellow.50',
        borderColor: 'yellow.200'
      },
      information_needed: {
        color: 'red',
        icon: XCircle,
        title: 'Information Needed',
        description: 'Your deal requires significant changes or additional information to meet compliance standards.',
        bgColor: 'red.50',
        borderColor: 'red.200'
      }
    };
    return configs[status] || configs.information_needed;
  };

  const statusConfig = getStatusConfig(prediction?.status || 'information_needed');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRenegotiate = () => {
    toast({
      title: 'Returning to Editor',
      description: 'You can modify your deal terms based on the recommendations.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate(`/clearinghouse-wizard/${dealId}?type=${dealType}`);
  };

  const handleCancelDeal = () => {
    toast({
      title: 'Deal Cancelled',
      description: 'Your deal has been cancelled and returned to draft status.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/dashboard');
  };

  return (
    <Container maxW="5xl" py={8}>
      {/* Header */}
      <VStack spacing={6} align="stretch" mb={8}>
        <Box textAlign="center">
          <Heading size="xl" color="brand.textPrimary" mb={2}>
            NIL Go Clearinghouse Analysis
          </Heading>
          <Text color="brand.textSecondary" fontSize="lg">
            Deal #{dealId} • {currentDeal.deal_nickname || 'Untitled Deal'}
          </Text>
        </Box>

        {/* Status Card */}
        <Card
          variant="outline"
          borderColor={statusConfig.borderColor}
          bg={statusConfig.bgColor}
          shadow="lg"
        >
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={4}>
                <Box
                  bg={`${statusConfig.color}.500`}
                  p={3}
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={statusConfig.icon} color="white" boxSize={8} />
                </Box>
                <Box flex="1" textAlign="left">
                  <Heading size="lg" color="brand.textPrimary" mb={2}>
                    {statusConfig.title}
                  </Heading>
                  <Text color="brand.textSecondary" fontSize="lg">
                    {statusConfig.description}
                  </Text>
                </Box>
                <Box textAlign="center">
                  <CircularProgress
                    value={prediction?.confidence || 0}
                    color={`${statusConfig.color}.500`}
                    size="80px"
                    thickness="8px"
                  >
                    <CircularProgressLabel
                      fontSize="lg"
                      fontWeight="bold"
                      color="brand.textPrimary"
                    >
                      {prediction?.confidence || 0}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="sm" color="brand.textSecondary" mt={2}>
                    Confidence
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Analysis Summary */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card variant="outline" borderColor="brand.accentSecondary">
            <CardBody textAlign="center">
              <Icon as={Users} color="blue.500" boxSize={8} mb={3} />
              <Stat>
                <StatLabel color="brand.textSecondary">Payor Association</StatLabel>
                <StatNumber color="brand.textPrimary">
                  {Math.round(prediction?.factors?.payor_association?.score || 0)}%
                </StatNumber>
                <StatHelpText>
                  {prediction?.details?.payor_verification?.risk_level === 'low' ? 'Low Risk' :
                   prediction?.details?.payor_verification?.risk_level === 'medium' ? 'Medium Risk' : 'High Risk'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card variant="outline" borderColor="brand.accentSecondary">
            <CardBody textAlign="center">
              <Icon as={Shield} color="green.500" boxSize={8} mb={3} />
              <Stat>
                <StatLabel color="brand.textSecondary">Business Purpose</StatLabel>
                <StatNumber color="brand.textPrimary">
                  {Math.round(prediction?.factors?.business_purpose?.score || 0)}%
                </StatNumber>
                <StatHelpText>
                  {prediction?.details?.business_purpose_verification?.has_valid_purpose ? 'Valid Purpose' : 'Needs Review'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card variant="outline" borderColor="brand.accentSecondary">
            <CardBody textAlign="center">
              <Icon as={DollarSign} color="purple.500" boxSize={8} mb={3} />
              <Stat>
                <StatLabel color="brand.textSecondary">Compensation Range</StatLabel>
                <StatNumber color="brand.textPrimary">
                  {Math.round(prediction?.factors?.compensation_range?.score || 0)}%
                </StatNumber>
                <StatHelpText>
                  {prediction?.details?.fmv_analysis?.estimated_fmv ?
                    `Est. FMV: ${formatCurrency(prediction.details.fmv_analysis.estimated_fmv)}` :
                    'Analysis Complete'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Issues and Recommendations */}
        {(prediction?.issues?.length > 0 || prediction?.recommendations?.length > 0) && (
          <Accordion allowToggle>
            {prediction?.issues?.length > 0 && (
              <AccordionItem border="none" mb={4}>
                <AccordionButton
                  bg="red.50"
                  _hover={{ bg: "red.100" }}
                  rounded="lg"
                  p={4}
                  border="1px"
                  borderColor="red.200"
                >
                  <HStack flex="1">
                    <Icon as={AlertCircle} color="red.500" />
                    <Text fontWeight="semibold" color="red.700">
                      Issues Identified ({prediction?.issues?.length || 0})
                    </Text>
                  </HStack>
                  <AccordionIcon color="red.500" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <List spacing={3}>
                    {prediction?.issues?.map((issue, index) => (
                      <ListItem key={index}>
                        <Alert status="error" rounded="md" size="sm">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">{issue.title}</AlertTitle>
                            <AlertDescription fontSize="sm">
                              {issue.description}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </ListItem>
                    ))}
                  </List>
                </AccordionPanel>
              </AccordionItem>
            )}

            {prediction?.recommendations?.length > 0 && (
              <AccordionItem border="none">
                <AccordionButton
                  bg="blue.50"
                  _hover={{ bg: "blue.100" }}
                  rounded="lg"
                  p={4}
                  border="1px"
                  borderColor="blue.200"
                >
                  <HStack flex="1">
                    <Icon as={CheckCircle} color="blue.500" />
                    <Text fontWeight="semibold" color="blue.700">
                      Recommendations ({prediction?.recommendations?.length || 0})
                    </Text>
                  </HStack>
                  <AccordionIcon color="blue.500" />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <List spacing={3}>
                    {prediction?.recommendations?.map((recommendation, index) => (
                      <ListItem key={index}>
                        <Alert status="info" rounded="md" size="sm">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">{recommendation.title}</AlertTitle>
                            <AlertDescription fontSize="sm">
                              {recommendation.description}
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </ListItem>
                    ))}
                  </List>
                </AccordionPanel>
              </AccordionItem>
            )}
          </Accordion>
        )}

        {/* Action Buttons */}
        <Card borderWidth="0" shadow="sm">
          <CardBody pt={8}>
            <VStack align="center" spacing={8}>
              <Heading size="2xl" color="brand.textPrimary" textAlign="center" fontWeight="bold">
                Next Steps
              </Heading>
              <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
                Based on your prediction results, choose how you'd like to proceed:
              </Text>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full" justifyItems="stretch">
                {/* Renegotiate Button */}
                <Box
                  as="button"
                  role="group"
                  onClick={handleRenegotiate}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="brand.accentSecondary"
                  px={6}
                  py={8}
                  textAlign="center"
                  transition="all 0.2s"
                  bg="white"
                  w="full"
                  minH="160px"
                  _hover={{
                    borderColor: "blue.400",
                    bg: "blue.50"
                  }}
                >
                  <Box
                    rounded="full"
                    bg="brand.backgroundLight"
                    p={3}
                    transition="all 0.2s"
                    _groupHover={{
                      bg: "blue.100"
                    }}
                  >
                    <Box
                      display="inline-block"
                      color="blue.500"
                      transition="color 0.2s"
                      _groupHover={{
                        color: "blue.600"
                      }}
                    >
                      <Icon as={RotateCcw} boxSize={6} color="currentColor" />
                    </Box>
                  </Box>
                  <VStack spacing={1}>
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Renegotiate
                    </Text>
                    <Text fontSize="xs" color="brand.textSecondary">
                      Modify deal terms
                    </Text>
                  </VStack>
                </Box>

                {/* Submit Deal Button */}
                <Box
                  as="button"
                  role="group"
                  onClick={() => navigate('/dashboard')}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="brand.accentSecondary"
                  px={6}
                  py={8}
                  textAlign="center"
                  transition="all 0.2s"
                  bg="white"
                  w="full"
                  minH="160px"
                  _hover={{
                    borderColor: "green.400",
                    bg: "green.50"
                  }}
                >
                  <Box
                    rounded="full"
                    bg="brand.backgroundLight"
                    p={3}
                    transition="colors 0.2s"
                    _groupHover={{
                      bg: "green.100"
                    }}
                  >
                    <Icon as={CheckCircle} boxSize={6} color="green.500" />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Submit Deal
                    </Text>
                    <Text fontSize="xs" color="brand.textSecondary">
                      Proceed with submission
                    </Text>
                  </VStack>
                </Box>

                {/* Cancel Deal Button */}
                <Box
                  as="button"
                  role="group"
                  onClick={handleCancelDeal}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="brand.accentSecondary"
                  px={6}
                  py={8}
                  textAlign="center"
                  transition="all 0.2s"
                  bg="white"
                  w="full"
                  minH="160px"
                  _hover={{
                    borderColor: "red.400",
                    bg: "red.50"
                  }}
                >
                  <Box
                    rounded="full"
                    bg="brand.backgroundLight"
                    p={3}
                    transition="colors 0.2s"
                    _groupHover={{
                      bg: "red.100"
                    }}
                  >
                    <Icon as={XCircle} boxSize={6} color="red.500" />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Cancel Deal
                    </Text>
                    <Text fontSize="xs" color="brand.textSecondary">
                      Return to drafts
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default ClearinghouseResult;