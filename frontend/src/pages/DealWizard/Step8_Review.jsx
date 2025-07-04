// frontend/src/pages/DealWizard/Step8_Review.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

const Step8_Review = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { deal, fetchDealById, updateDeal } = useDeal();
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
        // Add any final flags needed
        is_submitted: true,
        submission_complete: true
      };

      console.log('Submitting deal with data:', updateData);
      
      await updateDeal(dealId, updateData);
      
      // Navigate to success page
      navigate(`/add/deal/submission-success/${dealId}`);
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

  const getTotalCompensation = () => {
    return deal.compensation?.items?.reduce((total, item) => {
      if (item.type === 'cash' || item.type === 'bonus') {
        return total + (parseFloat(item.amount) || 0);
      }
      return total + (parseFloat(item.value) || 0);
    }, 0) || 0;
  };

  return (
    <Container maxW="4xl" py={8}>
      {/* Header */}
      <VStack spacing={6} align="stretch" mb={8}>
        <Box>
          <VStack spacing={3} mb={6}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="medium">
                Step 8 of 9
              </Text>
              <Text color="brand.textSecondary">
                88.9% Complete
              </Text>
            </Flex>
            <Progress
              value={88.9}
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
                <Text fontWeight="medium" color="brand.textSecondary">Total Value</Text>
                <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                  {formatCurrency(getTotalCompensation())}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="brand.textSecondary">Deal Period</Text>
                <Text color="brand.textPrimary">
                  {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
                </Text>
              </Box>
            </VStack>
          </SectionCard>

          <SectionCard title="Parties" icon={Users}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="brand.textSecondary">Payor</Text>
                <Text color="brand.textPrimary">{deal.payorInfo?.name}</Text>
                <Text fontSize="sm" color="brand.textSecondary">{deal.payorInfo?.type}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color="brand.textSecondary">Institution</Text>
                <Text color="brand.textPrimary">{deal.school}</Text>
                <Text fontSize="sm" color="brand.textSecondary">{deal.sport}</Text>
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
            </AccordionButton>
            <AccordionPanel pb={4}>
              <List spacing={3}>
                {Object.entries(deal.obligations || {}).map(([activity, details]) => (
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
            </AccordionButton>
            <AccordionPanel pb={4}>
              <List spacing={4}>
                {deal.compensation?.items.map((item, index) => (
                  <ListItem key={index}>
                    <Box
                      p={4}
                      bg="gray.50"
                      rounded="lg"
                      border="1px"
                      borderColor="brand.accentSecondary"
                    >
                      <Text fontWeight="semibold" color="brand.textPrimary" mb={2}>
                        {compensationTypes.find(t => t.value === item.type)?.label}
                      </Text>
                      {item.type === 'cash' && (
                        <>
                          <Text color="brand.textSecondary">Amount: {formatCurrency(item.amount)}</Text>
                          <Text color="brand.textSecondary">
                            Schedule: {paymentSchedules.find(s => s.value === item.schedule)?.label}
                          </Text>
                        </>
                      )}
                      {item.type === 'non-cash' && (
                        <>
                          <Text color="brand.textSecondary">{item.description}</Text>
                          <Text color="brand.textSecondary">Value: {formatCurrency(item.value)}</Text>
                        </>
                      )}
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
            </AccordionButton>
            <AccordionPanel pb={4}>
              <List spacing={3}>
                {Object.entries(deal.compliance || {}).map(([key, value]) => {
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
                              {deal.compliance[`${key}Info`] && (
                                <Text fontSize="sm" mt={1}>
                                  Additional Info: {deal.compliance[`${key}Info`]}
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
            onClick={() => navigate(`/add/deal/compensation/${dealId}`)}
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
  );
};

export default Step8_Review;
