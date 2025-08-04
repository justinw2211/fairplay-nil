// frontend/src/pages/DealWizard/Step6_Compensation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Progress,
  Select,
  Text,
  Textarea,
  VStack,
  useToast,
  Heading,
  HStack,
  IconButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { DollarSign, Plus, Trash2, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { formLogger } from '../../utils/logger';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';

// Types
const CompensationItem = {
  id: String,
  type: String,
  amount: String,
  schedule: String,
  description: String,
  value: String,
  percentage: String,
  requirements: String,
  paymentDate: String,
  expanded: Boolean,
};

const paymentSchedules = [
  { value: 'lump_sum', label: 'Lump Sum' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'per_deliverable', label: 'Per Deliverable' },
  { value: 'milestone_based', label: 'Milestone Based' },
  { value: 'other', label: 'Other' }
];

const compensationTypes = [
  { value: 'cash', label: 'Cash Payment', description: 'Direct monetary compensation' },
  { value: 'non-cash', label: 'Goods/Products', description: 'Physical items or services' },
  { value: 'bonus', label: 'Performance Bonus', description: 'Additional payment based on metrics' },
  { value: 'royalty', label: 'Royalty Payment', description: 'Percentage of sales or revenue' },
  { value: 'other', label: 'Other', description: 'Custom compensation type' },
];

const Step6_Compensation = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();
  const { user } = useAuth();
  const toast = useToast();

  const [compensationItems, setCompensationItems] = useState([
    {
      id: 1,
      type: "cash",
      amount: "",
      schedule: "",
      description: "",
      expanded: true
    }
  ]);

  const validateAmount = (value) => {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue > 0;
  };

  useEffect(() => {
    if (currentDeal?.compensation?.items) {
      setCompensationItems(currentDeal.compensation.items);

      formLogger.info('Compensation items loaded from deal', {
        dealId,
        dealType,
        step: 'Step6_Compensation',
        operation: 'useEffect',
        hasCompensationItems: !!currentDeal.compensation?.items,
        itemCount: currentDeal.compensation?.items?.length || 0
      });
    }
  }, [currentDeal]);

  const getTypeDescription = (type) => {
    const found = compensationTypes.find(ct => ct.value === type);
    return found ? found.description : '';
  };

  const updateCompensationItem = (id, field, value) => {
    setCompensationItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleExpanded = (id) => {
    setCompensationItems(prev => prev.map(item =>
      item.id === id ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const addCompensationItem = () => {
    const newId = Math.max(...compensationItems.map(item => item.id)) + 1;
    setCompensationItems(prev => [...prev, { id: newId, type: "cash", amount: "", schedule: "", description: "", expanded: true }]);
  };

  const removeCompensationItem = (id) => {
    if (compensationItems.length > 1) {
      setCompensationItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const isFormValid = () => {
    return compensationItems.every(item => {
      if (item.type === "cash") {
        return item.amount && validateAmount(item.amount) && item.schedule;
      } else if (item.type === "non-cash") {
        return item.description && item.value && validateAmount(item.value);
      } else if (item.type === "bonus") {
        return item.amount && item.requirements;
      } else if (item.type === "royalty") {
        return item.percentage && parseFloat(item.percentage) > 0 && parseFloat(item.percentage) <= 100;
      } else if (item.type === "other") {
        return item.description && item.value && validateAmount(item.value);
      }
      return false;
    });
  };

  const handleNext = async () => {
    if (!isFormValid()) {
      formLogger.debug('Compensation form validation failed - missing required fields');
      return;
    }

    // Format the data according to the backend schema
    const formattedData = {
      compensation_cash: 0,
      compensation_goods: [],
      compensation_other: []
    };

    // Process each compensation item
    compensationItems.forEach(item => {
      if (item.type === "cash") {
        formattedData.compensation_cash = parseFloat(item.amount) || 0;
      } else if (item.type === "non-cash") {
        formattedData.compensation_goods.push({
          description: item.description,
          value: parseFloat(item.value) || 0
        });
      } else if (item.type === "bonus" || item.type === "royalty" || item.type === "other") {
        formattedData.compensation_other.push({
          payment_type: item.type,
          description: item.type === "bonus" ? item.requirements : item.description,
          estimated_value: parseFloat(item.amount || item.value) || 0
        });
      }
    });

    formLogger.debug('Submitting compensation data');

    try {
      await updateDeal(dealId, formattedData);

      // ALL deal types now continue to deal-type step
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/deal-type/${dealId}${typeParam}`);
    } catch (error) {
      formLogger.error('Error updating deal', { error: error.message });
    }
  };

  const handleFinishLater = () => {
    navigate('/dashboard');
  };

  // Get progress information - all deal types use same 10-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '7 of 10',
      percentage: 70,
      isLastStep: false
    };
  };

  const progressInfo = getProgressInfo();

  const renderCompensationFields = (item) => {
    switch (item.type) {
      case "cash":
        return (
          <>
            <FormControl isInvalid={item.amount && !validateAmount(item.amount)}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Total Amount in USD *</FormLabel>
              <Box position="relative">
                <Icon
                  as={DollarSign}
                  position="absolute"
                  left="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                />
                <Input
                  type="number"
                  placeholder="500"
                  value={item.amount || ""}
                  onChange={(e) => updateCompensationItem(item.id, "amount", e.target.value)}
                  pl="10"
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                  min="0.01"
                  step="0.01"
                />
              </Box>
              {item.amount && !validateAmount(item.amount) && (
                <FormErrorMessage>Amount must be greater than 0</FormErrorMessage>
              )}
            </FormControl>

            <FormControl mt={6}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Payment Schedule *</FormLabel>
              <Select
                value={item.schedule || ""}
                onChange={(e) => updateCompensationItem(item.id, "schedule", e.target.value)}
                h="12"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
              >
                <option value="">Select payment schedule</option>
                {paymentSchedules.map(schedule => (
                  <option key={schedule.value} value={schedule.value}>
                    {schedule.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </>
        );

      case "non-cash":
        return (
          <>
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Description and Quantity *</FormLabel>
              <Textarea
                placeholder="e.g., '2 pairs of Nike shoes, 1 gym membership for 6 months'"
                value={item.description || ""}
                onChange={(e) => updateCompensationItem(item.id, "description", e.target.value)}
                minH="100px"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
                resize="none"
                rows={4}
              />
            </FormControl>

            <FormControl mt={6} isInvalid={item.value && !validateAmount(item.value)}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Estimated Value in USD *</FormLabel>
              <Box position="relative">
                <Icon
                  as={DollarSign}
                  position="absolute"
                  left="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                />
                <Input
                  type="number"
                  placeholder="250"
                  value={item.value || ""}
                  onChange={(e) => updateCompensationItem(item.id, "value", e.target.value)}
                  pl="10"
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                  min="0.01"
                  step="0.01"
                />
              </Box>
              {item.value && !validateAmount(item.value) && (
                <FormErrorMessage>Value must be greater than 0</FormErrorMessage>
              )}
            </FormControl>
          </>
        );

      case "bonus":
        return (
          <>
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Total Value of Bonus Payment *</FormLabel>
              <Box position="relative">
                <Icon
                  as={DollarSign}
                  position="absolute"
                  left="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                />
                <Input
                  type="number"
                  placeholder="1000"
                  value={item.amount || ""}
                  onChange={(e) => updateCompensationItem(item.id, "amount", e.target.value)}
                  pl="10"
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                />
              </Box>
            </FormControl>

            <FormControl mt={6}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Description of Requirements to Receive Bonus *</FormLabel>
              <Textarea
                placeholder="e.g., 'Bonus paid if social media post receives 10,000+ likes'"
                value={item.requirements || ""}
                onChange={(e) => updateCompensationItem(item.id, "requirements", e.target.value)}
                minH="100px"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
                resize="none"
                rows={4}
              />
            </FormControl>

            <FormControl mt={6}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Payment Date (optional)</FormLabel>
              <Input
                type="date"
                value={item.paymentDate || ""}
                onChange={(e) => updateCompensationItem(item.id, "paymentDate", e.target.value)}
                h="12"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
              />
            </FormControl>
          </>
        );

      case "royalty":
        return (
          <>
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Description *</FormLabel>
              <Textarea
                placeholder="e.g., '10% of net sales from merchandise featuring your name/image'"
                value={item.description || ""}
                onChange={(e) => updateCompensationItem(item.id, "description", e.target.value)}
                minH="100px"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
                resize="none"
                rows={4}
              />
            </FormControl>

            <FormControl mt={6} isInvalid={item.percentage && (parseFloat(item.percentage) <= 0 || parseFloat(item.percentage) > 100)}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Royalty Percentage *</FormLabel>
              <Box position="relative">
                <Input
                  type="number"
                  placeholder="10"
                  value={item.percentage || ""}
                  onChange={(e) => updateCompensationItem(item.id, "percentage", e.target.value)}
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                  min="0.01"
                  max="100"
                  step="0.01"
                />
                <Text
                  position="absolute"
                  right="3"
                  top="50%"
                  transform="translateY(-50%)"
                  color="brand.textSecondary"
                >
                  %
                </Text>
              </Box>
              {item.percentage && (parseFloat(item.percentage) <= 0 || parseFloat(item.percentage) > 100) && (
                <FormErrorMessage>Percentage must be between 0 and 100</FormErrorMessage>
              )}
            </FormControl>

            <FormControl mt={6}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Royalty Estimated Earnings (optional)</FormLabel>
              <Box position="relative">
                <Icon
                  as={DollarSign}
                  position="absolute"
                  left="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                />
                <Input
                  type="number"
                  placeholder="500"
                  value={item.value || ""}
                  onChange={(e) => updateCompensationItem(item.id, "value", e.target.value)}
                  pl="10"
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                />
              </Box>
            </FormControl>
          </>
        );

      case "other":
        return (
          <>
            <FormControl>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Description of Your Other Payment *</FormLabel>
              <Textarea
                placeholder="Please describe the other form of compensation..."
                value={item.description || ""}
                onChange={(e) => updateCompensationItem(item.id, "description", e.target.value)}
                minH="100px"
                borderColor="brand.accentSecondary"
                _focus={{
                  borderColor: "brand.accentPrimary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                }}
                resize="none"
                rows={4}
              />
            </FormControl>

            <FormControl mt={6}>
              <FormLabel color="brand.textPrimary" fontWeight="semibold">Estimated Earnings *</FormLabel>
              <Box position="relative">
                <Icon
                  as={DollarSign}
                  position="absolute"
                  left="3"
                  top="50%"
                  transform="translateY(-50%)"
                  w="4"
                  h="4"
                  color="brand.textSecondary"
                />
                <Input
                  type="number"
                  placeholder="250"
                  value={item.value || ""}
                  onChange={(e) => updateCompensationItem(item.id, "value", e.target.value)}
                  pl="10"
                  h="12"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                  }}
                />
              </Box>
            </FormControl>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <DealWizardStepWrapper stepNumber={6} stepName="Compensation Details">
      <Container maxW="3xl" py={6}>
        <Box
          borderWidth="1px"
          borderColor="brand.accentSecondary"
          shadow="lg"
          bg="white"
          rounded="lg"
        >
          {/* Header Section */}
          <Box p={6}>
            {/* Progress Indicator */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">
                  {progressInfo.stepNumber}
                </Text>
                <Text color="brand.textSecondary">
                  {progressInfo.percentage.toFixed(1)}% Complete
                </Text>
              </Flex>
              <Progress
                value={progressInfo.percentage}
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

            {/* Title Section */}
            <Flex gap={3} mb={4}>
              <Box
                w="12"
                h="12"
                bg="brand.accentPrimary"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
              >
                <Icon as={DollarSign} w="6" h="6" color="white" />
              </Box>
              <Box>
                <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                  Compensation Details
                </Text>
                <Text fontSize="lg" color="brand.textSecondary" mt={2}>
                  How are you being compensated for this deal? You can add multiple forms of payment.
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Content Section */}
          <Box p={6} pt={0}>
            <VStack spacing={6}>
              {/* Compensation Items */}
              {compensationItems.map((item) => (
                <Box
                  key={item.id}
                  w="full"
                  borderWidth="1px"
                  borderColor="brand.accentSecondary"
                  rounded="lg"
                  overflow="hidden"
                >
                  {/* Header */}
                  <Flex
                    p={4}
                    bg="gray.50"
                    cursor="pointer"
                    onClick={() => toggleExpanded(item.id)}
                    align="center"
                    justify="space-between"
                    _hover={{ bg: "gray.100" }}
                  >
                    <Flex align="center" gap={3}>
                      <Box
                        w="8"
                        h="8"
                        bg="brand.accentPrimary"
                        rounded="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={DollarSign} w="4" h="4" color="white" />
                      </Box>
                      <Box>
                        <Text fontWeight="semibold" color="brand.textPrimary">
                          {compensationTypes.find(t => t.value === item.type)?.label || "Select Type"}
                        </Text>
                        <Text fontSize="sm" color="brand.textSecondary">
                          {getTypeDescription(item.type)}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={2}>
                      {compensationItems.length > 1 && (
                        <IconButton
                          icon={<Icon as={Trash2} w="4" h="4" />}
                          variant="ghost"
                          size="sm"
                          color="red.600"
                          _hover={{ bg: "red.50", color: "red.700" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCompensationItem(item.id);
                          }}
                        />
                      )}
                      <Icon
                        as={item.expanded ? ChevronUp : ChevronDown}
                        w="5"
                        h="5"
                        color="brand.textSecondary"
                      />
                    </Flex>
                  </Flex>

                  {/* Expanded Content */}
                  {item.expanded && (
                    <Box p={6} borderTopWidth="1px" borderColor="brand.accentSecondary">
                      <FormControl mb={6}>
                        <FormLabel color="brand.textPrimary" fontWeight="semibold">
                          Type of Compensation *
                        </FormLabel>
                        <Select
                          value={item.type}
                          onChange={(e) => updateCompensationItem(item.id, "type", e.target.value)}
                          h="12"
                          borderColor="brand.accentSecondary"
                          _focus={{
                            borderColor: "brand.accentPrimary",
                            boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)"
                          }}
                        >
                          {compensationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {renderCompensationFields(item)}
                    </Box>
                  )}
                </Box>
              ))}

              {/* Add Another Button */}
              <Button
                variant="outline"
                w="full"
                h="12"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="brand.accentPrimary"
                color="brand.accentPrimary"
                leftIcon={<Icon as={Plus} w="4" h="4" />}
                onClick={addCompensationItem}
                _hover={{
                  bg: "brand.accentPrimary.50"
                }}
              >
                Add another form of compensation
              </Button>

              {/* Navigation */}
              <Flex justify="space-between" align="center" pt={8} w="full">
                <Button
                  leftIcon={<Icon as={Clock} w="5" h="5" />}
                  variant="ghost"
                  h="12"
                  px="6"
                  fontSize="base"
                  fontWeight="medium"
                  color="brand.textSecondary"
                  onClick={handleFinishLater}
                  _hover={{
                    color: "brand.textPrimary"
                  }}
                >
                  Finish Later
                </Button>

                <Flex gap={4}>
                  <Button
                    leftIcon={<Icon as={ChevronLeft} w="5" h="5" />}
                    variant="outline"
                    h="12"
                    px="6"
                    fontSize="base"
                    fontWeight="medium"
                    borderColor="brand.accentSecondary"
                    color="brand.textSecondary"
                    onClick={() => {
                      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
                      // ALL deal types go back to compliance step
                      navigate(`/add/deal/compliance/${dealId}${typeParam}`);
                    }}
                    _hover={{
                      bg: "brand.backgroundLight",
                      borderColor: "brand.accentPrimary",
                      color: "brand.textPrimary"
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<Icon as={ChevronRight} w="5" h="5" />}
                    h="12"
                    px="8"
                    fontSize="base"
                    fontWeight="semibold"
                    bg={isFormValid() ? "brand.accentPrimary" : "brand.accentSecondary"}
                    color="white"
                    isDisabled={!isFormValid()}
                    onClick={handleNext}
                    transition="all 0.2s"
                    _hover={
                      isFormValid()
                        ? {
                            transform: "scale(1.05)",
                            shadow: "xl"
                          }
                        : {}
                    }
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed"
                    }}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            </VStack>
          </Box>
        </Box>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step6_Compensation;