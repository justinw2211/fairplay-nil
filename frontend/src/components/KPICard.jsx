import React from 'react';
import { 
  Card, 
  CardBody, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  Badge,
  Tooltip,
  useColorModeValue,
  StatArrow,
  Progress,
  Box,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiInfo,
  FiDollarSign,
  FiBarChart,
  FiTarget,
  FiClock,
  FiCheck,
  FiActivity
} from 'react-icons/fi';

const KPICard = ({ 
  title, 
  value, 
  previousValue, 
  trend, 
  icon, 
  color = 'brand.accentPrimary',
  helpText,
  showProgress = false,
  progressValue = 0,
  maxValue = 100,
  onClick,
  isLoading = false,
  variant = 'default',
  ...props 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('brand.backgroundLight', 'gray.700');
  const trendColor = trend >= 0 ? 'green.500' : 'red.500';
  const trendIcon = trend >= 0 ? FiTrendingUp : FiTrendingDown;
  
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          fontSize: '3xl',
          iconSize: '24px',
          padding: 8
        };
      case 'compact':
        return {
          fontSize: 'lg',
          iconSize: '16px',
          padding: 4
        };
      default:
        return {
          fontSize: '2xl',
          iconSize: '20px',
          padding: 6
        };
    }
  };

  const styles = getVariantStyles();

  return (
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
        borderColor: color
      }}
      onClick={onClick}
      {...props}
    >
      <CardBody p={styles.padding}>
        <VStack align="stretch" spacing={3}>
          {/* Header with title and trend */}
          <Flex align="center" justify="space-between">
            <HStack>
              <Icon as={icon} color={color} boxSize={styles.iconSize} />
              <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                {title}
              </Text>
              {helpText && (
                <Tooltip label={helpText} placement="top">
                  <Icon as={FiInfo} color="gray.400" boxSize="12px" cursor="help" />
                </Tooltip>
              )}
            </HStack>
            
            {trend !== undefined && (
              <Badge colorScheme={trend >= 0 ? 'green' : 'red'} variant="subtle">
                <HStack spacing={1}>
                  <Icon as={trendIcon} boxSize="10px" />
                  <Text fontSize="xs">
                    {Math.abs(trend).toFixed(1)}%
                  </Text>
                </HStack>
              </Badge>
            )}
          </Flex>

          {/* Main value */}
          <HStack justify="space-between" align="end">
            <VStack align="start" spacing={1}>
              <Text 
                fontSize={styles.fontSize} 
                fontWeight="bold" 
                color="brand.textPrimary"
                lineHeight="none"
              >
                {isLoading ? '...' : formatValue(value)}
              </Text>
              
              {previousValue !== undefined && (
                <HStack>
                  <Text fontSize="xs" color="brand.textSecondary">
                    Previous: {formatValue(previousValue)}
                  </Text>
                  <StatArrow type={trend >= 0 ? 'increase' : 'decrease'} />
                </HStack>
              )}
            </VStack>
            
            {showProgress && (
              <Box minW="60px">
                <Progress 
                  value={progressValue} 
                  max={maxValue}
                  colorScheme={color.includes('red') ? 'red' : color.includes('green') ? 'green' : 'blue'}
                  size="sm" 
                  borderRadius="full"
                />
                <Text fontSize="xs" color="brand.textSecondary" textAlign="center" mt={1}>
                  {progressValue}%
                </Text>
              </Box>
            )}
          </HStack>

          {/* Additional metrics or children */}
          {props.children}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Specialized KPI Card variants
export const CurrencyKPICard = ({ value, previousValue, trend, ...props }) => (
  <KPICard
    value={`$${value?.toLocaleString() || 0}`}
    previousValue={previousValue ? `$${previousValue.toLocaleString()}` : undefined}
    trend={trend}
    icon={FiDollarSign}
    color="green.500"
    {...props}
  />
);

export const PercentageKPICard = ({ value, previousValue, trend, ...props }) => (
  <KPICard
    value={`${value?.toFixed(1) || 0}%`}
    previousValue={previousValue ? `${previousValue.toFixed(1)}%` : undefined}
    trend={trend}
    icon={FiTarget}
    color="blue.500"
    showProgress={true}
    progressValue={value}
    {...props}
  />
);

export const CountKPICard = ({ value, previousValue, trend, ...props }) => (
  <KPICard
    value={value || 0}
    previousValue={previousValue}
    trend={trend}
    icon={FiBarChart}
    color="purple.500"
    {...props}
  />
);

export const ActivityKPICard = ({ value, previousValue, trend, ...props }) => (
  <KPICard
    value={value || 0}
    previousValue={previousValue}
    trend={trend}
    icon={FiActivity}
    color="orange.500"
    {...props}
  />
);

export const CompletionKPICard = ({ value, total, previousValue, trend, ...props }) => (
  <KPICard
    value={value || 0}
    previousValue={previousValue}
    trend={trend}
    icon={FiCheck}
    color="green.500"
    showProgress={true}
    progressValue={total > 0 ? (value / total) * 100 : 0}
    {...props}
  />
);

export const PendingKPICard = ({ value, previousValue, trend, ...props }) => (
  <KPICard
    value={value || 0}
    previousValue={previousValue}
    trend={trend}
    icon={FiClock}
    color="yellow.500"
    {...props}
  />
);

export default KPICard; 