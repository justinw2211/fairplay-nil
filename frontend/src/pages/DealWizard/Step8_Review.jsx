// frontend/src/pages/DealWizard/Step8_Review.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
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
  SimpleGrid,
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
  HelpCircle,
  Edit,
} from 'lucide-react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';

// Import constants from Step6_Compensation.jsx
const compensationTypes = [
  { value: 'cash', label: 'Cash Payment', description: 'Direct monetary compensation' },
  { value: 'non-cash', label: 'Goods/Products', description: 'Physical items or services' },
  { value: 'bonus', label: 'Performance Bonus', description: 'Additional payment based on metrics' },
  { value: 'royalty', label: 'Royalty Payment', description: 'Percentage of sales or revenue' },
  { value: 'other', label: 'Other', description: 'Custom compensation type' },
];

const formatCurrency = (amount) => {
  try {
    if (!amount || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '$0.00';
  }
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

const SectionCard = ({ title, icon: IconComponent, children, onClick }) => (
  <Card
    variant="outline"
    borderColor="brand.accentSecondary"
    shadow="sm"
    onClick={onClick}
    cursor={onClick ? "pointer" : "default"}
    _hover={onClick ? { shadow: "md" } : {}}
  >
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
        {onClick && <Icon as={Edit} color="brand.textSecondary" boxSize={4} />}
      </HStack>
    </CardHeader>
    <CardBody bg="white">{children}</CardBody>
  </Card>
);

const Step8_Review = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const toast = useToast();
  const {
    deal,
    fetchDealById,
    updateDeal,
    getTotalCompensation: getTotalCompensationFromContext,
    getCompensationCash,
    getCompensationGoods,
    getCompensationOther,
    getPayorName,
    getPayorType,
    getUniversity,
    getSports,
    getDealNickname,
    getContactName,
    getContactEmail,
    getObligations
  } = useDeal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!deal && dealId) {
      fetchDealById(dealId);
    }
  }, [deal, dealId, fetchDealById]);

  if (!deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Update deal status and add submission timestamp
      const updateData = {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        is_submitted: true,
        submission_complete: true
      };

      console.log('Submitting deal with data:', updateData);

      await updateDeal(dealId, updateData);

      // Navigate based on deal type to appropriate prediction wizard
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';

      if (dealType === 'clearinghouse') {
        navigate(`/clearinghouse-wizard/${dealId}${typeParam}`);
      } else if (dealType === 'valuation') {
        navigate(`/valuation-wizard/${dealId}${typeParam}`);
      } else {
        // For simple and standard deals, go to success page
        navigate(`/add/deal/submission-success/${dealId}${typeParam}`);
      }
    } catch (error) {
      console.error('Error submitting deal:', error);
      toast({
        title: 'Error submitting deal',
        description: 'Please try again or contact support if the problem persists.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  };

  // Use the context function for total compensation calculation
  const getTotalCompensation = () => {
    try {
      return getTotalCompensationFromContext(deal);
    } catch (error) {
      console.error('Error calculating total compensation:', error);
      return 0;
    }
  };

  // Get deal duration from endorsement data
  const getDealDuration = () => {
    try {
      const endorsementData = getObligations(deal)?.endorsements;
      if (endorsementData?.duration) {
        return endorsementData.duration;
      }
      return 'Duration not specified';
    } catch (error) {
      console.error('Error getting deal duration:', error);
      return 'Duration not specified';
    }
  };

  return (
    <DealWizardStepWrapper stepNumber={9} stepName="Review & Submit" dealId={dealId}>
      <Container maxW="4xl" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box>
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">
                  Step 9 of 10
                </Text>
                <Text color="brand.textSecondary">
                  90% Complete
                </Text>
              </Flex>
              <Progress
                value={90}
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
              <Heading size="lg" color="brand.textPrimary">Review Your Deal</Heading>
              <StatusBadge status={deal.status} />
            </Flex>
            <Text color="brand.textSecondary">
              Please review all details carefully before submitting your deal for approval.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <SectionCard title="Deal Overview" icon={Briefcase}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Deal Name</Text>
                  <Text color="brand.textPrimary">{getDealNickname(deal)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Total Value</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                    {formatCurrency(getTotalCompensation())}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Deal Period</Text>
                  <Text color="brand.textPrimary">
                    {getDealDuration()}
                  </Text>
                </Box>
              </VStack>
            </SectionCard>

            <SectionCard title="Parties" icon={Users}>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Payor</Text>
                  <Text color="brand.textPrimary">{getPayorName(deal)}</Text>
                  <Text fontSize="sm" color="brand.textSecondary">{getPayorType(deal)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Institution</Text>
                  <Text color="brand.textPrimary">{getUniversity(deal)}</Text>
                  <Text fontSize="sm" color="brand.textSecondary">{getSports(deal)}</Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" color="brand.textSecondary">Contact</Text>
                  <Text color="brand.textPrimary">{getContactName(deal)}</Text>
                  <Text fontSize="sm" color="brand.textSecondary">{getContactEmail(deal)}</Text>
                </Box>
              </VStack>
            </SectionCard>
          </SimpleGrid>

          <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
            <AccordionItem border="none" mb={4}>
              <AccordionButton
                bg="brand.backgroundLight"
                _hover={{ bg: 'brand.backgroundLight' }}
                rounded="lg"
                p={4}
              >
                <HStack flex="1">
                  <Icon as={Calendar} />
                  <Text fontWeight="semibold">Activities & Obligations</Text>
                </HStack>
                <AccordionIcon />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/add/deal/activities/select/${dealId}?type=${dealType}`);
                  }}
                  leftIcon={<Icon as={Edit} />}
                >
                  Edit
                </Button>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <List spacing={3}>
                  {Object.entries(getObligations(deal)).map(([activity, details]) => (
                    <ListItem key={activity}>
                      <HStack align="start">
                        <Icon as={CheckCircle} color="green.500" mt={1} />
                        <Box>
                          <Text fontWeight="semibold" color="brand.textPrimary">{activity}</Text>
                          <Text color="brand.textSecondary">
                            {typeof details === 'object' && details.description
                              ? details.description
                              : 'Details provided'}
                          </Text>
                        </Box>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={4}>
              <AccordionButton
                bg="brand.backgroundLight"
                _hover={{ bg: 'brand.backgroundLight' }}
                rounded="lg"
                p={4}
              >
                <HStack flex="1">
                  <Icon as={DollarSign} />
                  <Text fontWeight="semibold">Compensation Details</Text>
                </HStack>
                <AccordionIcon />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/add/deal/compensation/${dealId}?type=${dealType}`);
                  }}
                  leftIcon={<Icon as={Edit} />}
                >
                  Edit
                </Button>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <List spacing={4}>
                  {/* Cash Compensation */}
                  {getCompensationCash(deal) > 0 && (
                    <ListItem>
                      <Box
                        p={4}
                        bg="gray.50"
                        rounded="lg"
                        border="1px"
                        borderColor="brand.accentSecondary"
                      >
                        <Text fontWeight="semibold" color="brand.textPrimary" mb={2}>
                          Cash Payment
                        </Text>
                        <Text color="brand.textSecondary">Amount: {formatCurrency(getCompensationCash(deal))}</Text>
                      </Box>
                    </ListItem>
                  )}

                  {/* Goods Compensation */}
                  {getCompensationGoods(deal).map((item, index) => (
                    <ListItem key={index}>
                      <Box
                        p={4}
                        bg="gray.50"
                        rounded="lg"
                        border="1px"
                        borderColor="brand.accentSecondary"
                      >
                        <Text fontWeight="semibold" color="brand.textPrimary" mb={2}>
                          Goods/Products
                        </Text>
                        <Text color="brand.textSecondary">{item.description}</Text>
                        <Text color="brand.textSecondary">Value: {formatCurrency(item.value || item.estimated_value)}</Text>
                      </Box>
                    </ListItem>
                  ))}

                  {/* Other Compensation */}
                  {getCompensationOther(deal).map((item, index) => (
                    <ListItem key={index}>
                      <Box
                        p={4}
                        bg="gray.50"
                        rounded="lg"
                        border="1px"
                        borderColor="brand.accentSecondary"
                      >
                        <Text fontWeight="semibold" color="brand.textPrimary" mb={2}>
                          {compensationTypes.find(t => t.value === item.payment_type)?.label || 'Other Payment'}
                        </Text>
                        <Text color="brand.textSecondary">{item.description}</Text>
                        <Text color="brand.textSecondary">Value: {formatCurrency(item.estimated_value)}</Text>
                      </Box>
                    </ListItem>
                  ))}
                </List>
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
                  <Text fontWeight="semibold">Compliance Information</Text>
                </HStack>
                <AccordionIcon />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/add/deal/compliance/${dealId}?type=${dealType}`);
                  }}
                  leftIcon={<Icon as={Edit} />}
                >
                  Edit
                </Button>
              </AccordionButton>
              <AccordionPanel pb={4}>
                <List spacing={3}>
                  {Object.entries(getObligations(deal)).filter(([key, _value]) =>
                    key === 'uses_school_ip' || key === 'grant_exclusivity' || key === 'licenses_nil'
                  ).map(([key, value]) => {
                    if (typeof value === 'string' && !key.includes('Info')) {
                      return (
                        <ListItem key={key}>
                          <HStack align="start">
                            <Icon
                              as={value === 'yes' ? CheckCircle : value === 'no' ? AlertCircle : HelpCircle}
                              color={value === 'yes' ? 'green.500' : value === 'no' ? 'red.500' : 'yellow.500'}
                              mt={1}
                            />
                            <Box>
                              <Text fontWeight="semibold" color="brand.textPrimary">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Text>
                              <Text color="brand.textSecondary">
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                                {getObligations(deal)[`${key}Info`] && (
                                  <Text fontSize="sm" mt={1}>
                                    Additional Info: {getObligations(deal)[`${key}Info`]}
                                  </Text>
                                )}
                              </Text>
                            </Box>
                          </HStack>
                        </ListItem>
                      );
                    }
                    return null;
                  })}
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>

        {/* Footer Navigation */}
        <Box
          borderTop="1px"
          borderColor="brand.accentSecondary"
          pt={6}
          mt={8}
        >
          <Flex justify="space-between">
            <Button
              leftIcon={<Icon as={ChevronLeft} />}
              variant="ghost"
              color="brand.textSecondary"
              onClick={() => navigate(`/add/deal/compensation/${dealId}?type=${dealType}`)}
              px={8}
              py={6}
              h="auto"
              fontSize="md"
              _hover={{
                bg: "brand.backgroundLight",
                color: "brand.textPrimary",
              }}
            >
              Back
            </Button>

            <Flex gap={4}>
              <Button
                variant="ghost"
                color="brand.textSecondary"
                onClick={() => navigate('/dashboard')}
                px={8}
                py={6}
                h="auto"
                fontSize="md"
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Save as Draft
              </Button>

              <Button
                rightIcon={<Icon as={ChevronRight} />}
                variant="solid"
                bg="brand.accentPrimary"
                color="white"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Submitting..."
                px={8}
                py={6}
                h="auto"
                fontSize="md"
                fontWeight="semibold"
                transition="all 0.2s"
                _hover={{
                  bg: "brand.accentPrimaryHover",
                }}
              >
                Submit Deal
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step8_Review;