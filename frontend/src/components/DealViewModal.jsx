// frontend/src/components/DealViewModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Heading,
  List,
  ListItem,
  Icon,
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
  HelpCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { getCompanySizeLabel } from '../data/companySizes';
import { formatIndustries } from '../data/industries';
import { ResultBadges } from './ResultBadge';

// Compensation types for display
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

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatDuration = (years, months) => {
  if ((!years || years === 0) && (!months || months === 0)) {
    return 'Not specified';
  }
  
  const parts = [];
  if (years && years > 0) {
    parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  }
  if (months && months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }
  
  return parts.join(', ');
};

const formatDealType = (dealType) => {
  const types = {
    simple: 'Simple Deal Logging',
    clearinghouse: 'NIL Go Clearinghouse Check',
    valuation: 'Deal Valuation Analysis',
  };
  return types[dealType] || dealType || 'Standard Deal';
};

const DealStatusBadge = ({ status }) => {
  const statusProps = {
    draft: { colorScheme: 'gray', label: 'Draft' },
    submitted: { colorScheme: 'yellow', label: 'Under Review' },
    approved: { colorScheme: 'green', label: 'Approved' },
    rejected: { colorScheme: 'red', label: 'Rejected' },
    active: { colorScheme: 'blue', label: 'Active' },
    completed: { colorScheme: 'green', label: 'Completed' },
    cancelled: { colorScheme: 'gray', label: 'Cancelled' },
  }[status] || { colorScheme: 'gray', label: status || 'Draft' };

  return (
    <Badge colorScheme={statusProps.colorScheme} px={3} py={1} rounded="full">
      {statusProps.label}
    </Badge>
  );
};

const DealViewModal = ({ isOpen, onClose, deal }) => {
  const navigate = useNavigate();
  const {
    getPayorName,
    getPayorType,
    getUniversity,
    getSports,
    getDealNickname,
    getContactName,
    getContactEmail,
    getObligations,
    getTotalCompensation,
    getCompensationCash,
    getCompensationGoods,
    getCompensationOther,
  } = useDeal();

  if (!deal) {
    return null;
  }

  const handleEditDeal = () => {
    onClose();
    const dealType = deal.deal_type || 'simple';
    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    
    // Navigate to the first step of the wizard for draft deals
    // For submitted/completed deals, navigate to review step
    if (deal.status === 'draft') {
      navigate(`/add/deal/social-media/${deal.id}${typeParam}`);
    } else {
      navigate(`/add/deal/review/${deal.id}${typeParam}`);
    }
  };

  const handleViewFullResults = (resultType) => {
    onClose();
    const dealType = deal.deal_type || 'simple';
    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    
    if (resultType === 'clearinghouse') {
      navigate(`/clearinghouse-result/${deal.id}${typeParam}`);
    } else if (resultType === 'valuation') {
      navigate(`/valuation-result/${deal.id}${typeParam}`);
    }
  };

  const getTotalCompensationValue = () => {
    try {
      return getTotalCompensation(deal);
    } catch (error) {
      console.error('Error calculating total compensation:', error);
      return 0;
    }
  };

  const obligations = getObligations(deal) || {};
  const hasClearinghouse = deal.clearinghouse_prediction;
  const hasValuation = deal.valuation_prediction;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="4xl" maxH="90vh" overflowY="auto">
        <ModalHeader>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Heading size="md" color="brand.textPrimary">
                {getDealNickname(deal)}
              </Heading>
              <DealStatusBadge status={deal.status} />
            </HStack>
            <HStack spacing={4} fontSize="sm">
              <Text color="brand.textSecondary">
                <Text as="span" fontWeight="medium">Deal Type:</Text> {formatDealType(deal.deal_type)}
              </Text>
              <Text color="brand.textSecondary">
                <Text as="span" fontWeight="medium">FMV:</Text> {formatCurrency(deal.fmv || getTotalCompensationValue())}
              </Text>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Deal Overview and Parties */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box
                p={4}
                border="1px"
                borderColor="brand.accentSecondary"
                borderRadius="lg"
                bg="brand.backgroundLight"
              >
                <HStack spacing={2} mb={3}>
                  <Icon as={Briefcase} color="brand.accentPrimary" />
                  <Heading size="sm" color="brand.textPrimary">Deal Overview</Heading>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Deal Name</Text>
                    <Text color="brand.textPrimary">{getDealNickname(deal)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Total Value</Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary">
                      {formatCurrency(getTotalCompensationValue())}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Duration</Text>
                    <Text color="brand.textPrimary">
                      {formatDuration(deal.deal_duration_years, deal.deal_duration_months)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Created</Text>
                    <Text color="brand.textPrimary">{formatDate(deal.created_at)}</Text>
                  </Box>
                </VStack>
              </Box>

              <Box
                p={4}
                border="1px"
                borderColor="brand.accentSecondary"
                borderRadius="lg"
                bg="brand.backgroundLight"
              >
                <HStack spacing={2} mb={3}>
                  <Icon as={Users} color="brand.accentPrimary" />
                  <Heading size="sm" color="brand.textPrimary">Parties</Heading>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Payor</Text>
                    <Text color="brand.textPrimary">{getPayorName(deal)}</Text>
                    <Text fontSize="xs" color="brand.textSecondary">{getPayorType(deal)}</Text>
                  </Box>
                  {deal.payor_company_size && (
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Company Size</Text>
                      <Text color="brand.textPrimary">{getCompanySizeLabel(deal.payor_company_size)}</Text>
                    </Box>
                  )}
                  {deal.payor_industries && deal.payor_industries.length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Industries</Text>
                      <Text color="brand.textPrimary">{formatIndustries(deal.payor_industries)}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Institution</Text>
                    <Text color="brand.textPrimary">{getUniversity(deal)}</Text>
                    <Text fontSize="xs" color="brand.textSecondary">{getSports(deal)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="brand.textSecondary">Contact</Text>
                    <Text color="brand.textPrimary">{getContactName(deal)}</Text>
                    <Text fontSize="xs" color="brand.textSecondary">{getContactEmail(deal)}</Text>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>

            {/* Analysis Results Section (if available) */}
            {(hasClearinghouse || hasValuation) && (
              <Box
                p={4}
                border="1px"
                borderColor="brand.accentSecondary"
                borderRadius="lg"
                bg="brand.backgroundLight"
              >
                <HStack spacing={2} mb={3}>
                  <Icon as={TrendingUp} color="brand.accentPrimary" />
                  <Heading size="sm" color="brand.textPrimary">Analysis Results</Heading>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  <ResultBadges deal={deal} />
                  {hasClearinghouse && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FileText} />}
                      onClick={() => handleViewFullResults('clearinghouse')}
                    >
                      View Full Clearinghouse Results
                    </Button>
                  )}
                  {hasValuation && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FileText} />}
                      onClick={() => handleViewFullResults('valuation')}
                    >
                      View Full Valuation Results
                    </Button>
                  )}
                </VStack>
              </Box>
            )}

            {/* Accordion Sections */}
            <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
              {/* Activities & Obligations */}
              {(() => {
                const activityKeys = Object.keys(obligations).filter((key) => 
                  !['uses_school_ip', 'grant_exclusivity', 'licenses_nil'].includes(key) &&
                  !key.endsWith('Info')
                );
                return activityKeys.length > 0 && (
                  <AccordionItem border="none" mb={3}>
                    <AccordionButton
                      bg="brand.backgroundLight"
                      _hover={{ bg: 'brand.backgroundLight' }}
                      rounded="lg"
                      p={3}
                    >
                      <HStack flex="1">
                        <Icon as={Calendar} color="brand.accentPrimary" />
                        <Text fontWeight="semibold" fontSize="sm">Activities & Obligations</Text>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <List spacing={2}>
                        {activityKeys.map((activity) => {
                          const details = obligations[activity];
                          const activityLabels = {
                            'social-media': 'Social Media',
                            'endorsements': 'Endorsements',
                            'appearances': 'Appearances',
                            'appearance': 'Appearances',
                            'content-for-brand': 'Content Creation',
                            'autographs': 'Autographs',
                            'merch-and-products': 'Merchandise',
                            'other': 'Other',
                          };
                          
                          return (
                            <ListItem key={activity}>
                              <HStack align="start">
                                <Icon as={CheckCircle} color="green.500" mt={1} boxSize={4} />
                                <Box>
                                  <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary">
                                    {activityLabels[activity] || activity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Text>
                                  {typeof details === 'object' && details !== null && (
                                    <>
                                      {details.description && (
                                        <Text fontSize="xs" color="brand.textSecondary">
                                          {details.description}
                                        </Text>
                                      )}
                                      {details.platforms && Array.isArray(details.platforms) && (
                                        <Text fontSize="xs" color="brand.textSecondary">
                                          Platforms: {details.platforms.join(', ')}
                                        </Text>
                                      )}
                                      {details.duration && (
                                        <Text fontSize="xs" color="brand.textSecondary">
                                          Duration: {details.duration}
                                        </Text>
                                      )}
                                      {!details.description && !details.platforms && !details.duration && (
                                        <Text fontSize="xs" color="brand.textSecondary">
                                          Details provided
                                        </Text>
                                      )}
                                    </>
                                  )}
                                  {typeof details !== 'object' && (
                                    <Text fontSize="xs" color="brand.textSecondary">
                                      {String(details)}
                                    </Text>
                                  )}
                                </Box>
                              </HStack>
                            </ListItem>
                          );
                        })}
                      </List>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })()}

              {/* Compensation Details */}
              {(getCompensationCash(deal) > 0 || 
                getCompensationGoods(deal).length > 0 || 
                getCompensationOther(deal).length > 0) && (
                <AccordionItem border="none" mb={3}>
                  <AccordionButton
                    bg="brand.backgroundLight"
                    _hover={{ bg: 'brand.backgroundLight' }}
                    rounded="lg"
                    p={3}
                  >
                    <HStack flex="1">
                      <Icon as={DollarSign} color="brand.accentPrimary" />
                      <Text fontWeight="semibold" fontSize="sm">Compensation Details</Text>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <List spacing={3}>
                      {/* Cash Compensation */}
                      {getCompensationCash(deal) > 0 && (
                        <ListItem>
                          <Box
                            p={3}
                            bg="gray.50"
                            rounded="lg"
                            border="1px"
                            borderColor="brand.accentSecondary"
                          >
                            <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary" mb={1}>
                              Cash Payment
                            </Text>
                            <Text fontSize="xs" color="brand.textSecondary">
                              Amount: {formatCurrency(getCompensationCash(deal))}
                            </Text>
                            {deal.compensation_cash_schedule && (
                              <Text fontSize="xs" color="brand.textSecondary" mt={1}>
                                Schedule: {deal.compensation_cash_schedule.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Text>
                            )}
                          </Box>
                        </ListItem>
                      )}

                      {/* Goods Compensation */}
                      {getCompensationGoods(deal).map((item, index) => (
                        <ListItem key={index}>
                          <Box
                            p={3}
                            bg="gray.50"
                            rounded="lg"
                            border="1px"
                            borderColor="brand.accentSecondary"
                          >
                            <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary" mb={1}>
                              Goods/Products
                            </Text>
                            <Text fontSize="xs" color="brand.textSecondary">{item.description}</Text>
                            <Text fontSize="xs" color="brand.textSecondary">
                              Value: {formatCurrency(item.value || item.estimated_value)}
                            </Text>
                          </Box>
                        </ListItem>
                      ))}

                      {/* Other Compensation */}
                      {getCompensationOther(deal).map((item, index) => (
                        <ListItem key={index}>
                          <Box
                            p={3}
                            bg="gray.50"
                            rounded="lg"
                            border="1px"
                            borderColor="brand.accentSecondary"
                          >
                            <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary" mb={1}>
                              {compensationTypes.find(t => t.value === item.payment_type)?.label || 'Other Payment'}
                            </Text>
                            <Text fontSize="xs" color="brand.textSecondary">{item.description}</Text>
                            <Text fontSize="xs" color="brand.textSecondary">
                              Value: {formatCurrency(item.estimated_value)}
                            </Text>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Compliance Information */}
              {(deal.uses_school_ip !== null || deal.grant_exclusivity || deal.licenses_nil) && (
                <AccordionItem border="none">
                  <AccordionButton
                    bg="brand.backgroundLight"
                    _hover={{ bg: 'brand.backgroundLight' }}
                    rounded="lg"
                    p={3}
                  >
                    <HStack flex="1">
                      <Icon as={Shield} color="brand.accentPrimary" />
                      <Text fontWeight="semibold" fontSize="sm">Compliance Information</Text>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <List spacing={2}>
                      {deal.uses_school_ip !== null && deal.uses_school_ip !== undefined && (
                        <ListItem>
                          <HStack align="start">
                            <Icon
                              as={deal.uses_school_ip ? CheckCircle : AlertCircle}
                              color={deal.uses_school_ip ? 'green.500' : 'red.500'}
                              mt={1}
                              boxSize={4}
                            />
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary">
                                Uses School IP
                              </Text>
                              <Text fontSize="xs" color="brand.textSecondary">
                                {deal.uses_school_ip ? 'Yes' : 'No'}
                              </Text>
                            </Box>
                          </HStack>
                        </ListItem>
                      )}
                      {deal.grant_exclusivity && (
                        <ListItem>
                          <HStack align="start">
                            <Icon as={HelpCircle} color="blue.500" mt={1} boxSize={4} />
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary">
                                Grant Exclusivity
                              </Text>
                              <Text fontSize="xs" color="brand.textSecondary">
                                {deal.grant_exclusivity}
                              </Text>
                            </Box>
                          </HStack>
                        </ListItem>
                      )}
                      {deal.licenses_nil && (
                        <ListItem>
                          <HStack align="start">
                            <Icon as={HelpCircle} color="blue.500" mt={1} boxSize={4} />
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="brand.textPrimary">
                                Licenses NIL
                              </Text>
                              <Text fontSize="xs" color="brand.textSecondary">
                                {deal.licenses_nil}
                              </Text>
                            </Box>
                          </HStack>
                        </ListItem>
                      )}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            Close
          </Button>
          <Button
            bg="brand.accentPrimary"
            color="white"
            onClick={handleEditDeal}
            _hover={{ bg: '#c9b2a9' }}
          >
            Edit Deal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DealViewModal;

