// src/components/SummaryCards.jsx
import React from 'react';
import { 
  SimpleGrid, Box, Text, Card, CardBody, Icon, VStack, HStack, useColorModeValue,
  Progress, Badge, Tooltip
} from '@chakra-ui/react';
import { FiDollarSign, FiTrendingUp, FiFileText, FiClock, FiCheck, FiAlertTriangle, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const SummaryCards = ({ deals }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('brand.backgroundLight', 'gray.700');

  // Ensure deals is always a valid array
  const safeDeals = React.useMemo(() => {
    if (!deals || !Array.isArray(deals)) {
      return [];
    }
    // Filter out any invalid deal objects
    return deals.filter(deal => deal && typeof deal === 'object');
  }, [deals]);

  // Calculate statistics
  const totalValue = safeDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0);
  const activeDeals = safeDeals.filter(deal => deal.status === 'active' || deal.status === 'Active').length;
  const completedDeals = safeDeals.filter(deal => deal.status === 'completed').length;
  const draftDeals = safeDeals.filter(deal => deal.status === 'draft').length;
  const totalDeals = safeDeals.length;
  
  // Deal type breakdown
  const dealTypes = {
    simple: safeDeals.filter(deal => deal.deal_type === 'simple').length,
    clearinghouse: safeDeals.filter(deal => deal.deal_type === 'clearinghouse').length,
    valuation: safeDeals.filter(deal => deal.deal_type === 'valuation').length
  };

  // Calculate completion rate
  const completionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

  // Calculate average deal value
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Enhanced summary card component
  const SummaryCard = ({ title, value, icon, color, helpText, trend, onClick, children }) => (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg"
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.3s ease"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: 'brand.accentPrimary'
      }}
      onClick={onClick}
    >
      <CardBody p={6}>
        <HStack justify="space-between" align="start" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={icon} color={color} boxSize="20px" />
              <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                {title}
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
              {value}
            </Text>
          </VStack>
          {trend && (
            <Badge colorScheme={trend > 0 ? 'green' : 'red'} variant="subtle">
              <HStack spacing={1}>
                <Icon as={trend > 0 ? FiArrowUp : FiArrowDown} boxSize="10px" />
                <Text fontSize="xs">{Math.abs(trend)}%</Text>
              </HStack>
            </Badge>
          )}
        </HStack>
        {helpText && (
          <Text fontSize="sm" color="brand.textSecondary" mb={2}>
            {helpText}
          </Text>
        )}
        {children}
      </CardBody>
    </Card>
  );

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
      <SummaryCard
        title="Total Deal Value"
        value={formatCurrency(totalValue)}
        icon={FiDollarSign}
        color="brand.accentPrimary"
        helpText={`Average: ${formatCurrency(avgDealValue)}`}
      />
      
      <SummaryCard
        title="Active Deals"
        value={activeDeals}
        icon={FiTrendingUp}
        color="green.500"
        helpText={`${totalDeals} total deals`}
      >
        <Progress 
          value={totalDeals > 0 ? (activeDeals / totalDeals) * 100 : 0} 
          colorScheme="green" 
          size="sm" 
          borderRadius="full"
        />
      </SummaryCard>
      
      <SummaryCard
        title="Completion Rate"
        value={formatPercent(completionRate)}
        icon={FiCheck}
        color="blue.500"
        helpText={`${completedDeals} completed`}
      >
        <Progress 
          value={completionRate} 
          colorScheme="blue" 
          size="sm" 
          borderRadius="full"
        />
      </SummaryCard>
      
      <SummaryCard
        title="Draft Deals"
        value={draftDeals}
        icon={FiClock}
        color="orange.500"
        helpText={draftDeals > 0 ? "Needs attention" : "All caught up"}
      >
        {draftDeals > 0 && (
          <HStack spacing={2} mt={2}>
            <Icon as={FiAlertTriangle} color="orange.500" boxSize="16px" />
            <Text fontSize="xs" color="orange.500">
              Complete drafts to activate
            </Text>
          </HStack>
        )}
      </SummaryCard>
    </SimpleGrid>
  );
};

export default SummaryCards;