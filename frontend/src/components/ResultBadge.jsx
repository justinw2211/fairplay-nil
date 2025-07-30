import React from 'react';
import { Badge, Tooltip, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ResultBadge = ({ deal, type = 'auto' }) => {
  const navigate = useNavigate();

  // Auto-detect result type if not specified
  const detectResultType = (deal) => {
    if (deal.clearinghouse_prediction) {return 'clearinghouse';}
    if (deal.valuation_prediction) {return 'valuation';}
    return null;
  };

  const resultType = type === 'auto' ? detectResultType(deal) : type;

  if (!resultType) {
    return null; // No prediction results to show
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getClearinghouseConfig = (prediction) => {
    const status = prediction?.status;

    switch (status) {
      case 'cleared':
        return {
          colorScheme: 'green',
          label: 'Cleared',
          tooltip: `NIL Go Status: Cleared (${prediction.confidence}% confidence)`,
          bgColor: 'green.50',
          borderColor: 'green.200'
        };
      case 'in_review':
        return {
          colorScheme: 'yellow',
          label: 'Review',
          tooltip: `NIL Go Status: Additional review required (${prediction.confidence}% confidence)`,
          bgColor: 'yellow.50',
          borderColor: 'yellow.200'
        };
      case 'information_needed':
        return {
          colorScheme: 'red',
          label: 'Info Needed',
          tooltip: `NIL Go Status: Information needed (${prediction.confidence}% confidence)`,
          bgColor: 'red.50',
          borderColor: 'red.200'
        };
      default:
        return {
          colorScheme: 'gray',
          label: 'Unknown',
          tooltip: 'Clearinghouse status unknown',
          bgColor: 'gray.50',
          borderColor: 'gray.200'
        };
    }
  };

  const getValuationConfig = (prediction) => {
    const currentCompensation = parseFloat(deal.compensation_cash) || 0;
    const fmv = prediction?.estimated_fmv || 0;
    const lowRange = prediction?.low_range || 0;
    const highRange = prediction?.high_range || 0;
    const confidence = prediction?.confidence || 0;

    const difference = fmv > 0 ? ((currentCompensation - fmv) / fmv) * 100 : 0;

    if (Math.abs(difference) <= 15) {
      return {
        colorScheme: 'green',
        label: 'Fair Value',
        tooltip: `FMV: ${formatCurrency(lowRange)} - ${formatCurrency(highRange)} (${confidence}% confidence)`,
        bgColor: 'green.50',
        borderColor: 'green.200'
      };
    } else if (difference > 15) {
      return {
        colorScheme: 'purple',
        label: 'Above Market',
        tooltip: `FMV: ${formatCurrency(lowRange)} - ${formatCurrency(highRange)} (${confidence}% confidence)`,
        bgColor: 'purple.50',
        borderColor: 'purple.200'
      };
    } else {
      return {
        colorScheme: 'red',
        label: 'Below Market',
        tooltip: `FMV: ${formatCurrency(lowRange)} - ${formatCurrency(highRange)} (${confidence}% confidence)`,
        bgColor: 'red.50',
        borderColor: 'red.200'
      };
    }
  };

  const handleClick = () => {
    const dealTypeParam = deal.deal_type || 'standard';

    if (resultType === 'clearinghouse') {
      navigate(`/clearinghouse-result/${deal.id}?type=${dealTypeParam}`);
    } else if (resultType === 'valuation') {
      navigate(`/valuation-result/${deal.id}?type=${dealTypeParam}`);
    }
  };

  let config;
  if (resultType === 'clearinghouse') {
    config = getClearinghouseConfig(deal.clearinghouse_prediction);
  } else if (resultType === 'valuation') {
    config = getValuationConfig(deal.valuation_prediction);
  }

  if (!config) {
    return null;
  }

  const hoverBg = useColorModeValue('brand.backgroundLight', 'gray.700');

  return (
    <Tooltip label={config.tooltip} placement="top" hasArrow>
      <Badge
        colorScheme={config.colorScheme}
        variant="solid"
        px={3}
        py={1}
        rounded="full"
        cursor="pointer"
        fontSize="xs"
        fontWeight="medium"
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-1px)',
          shadow: 'md',
          bg: hoverBg
        }}
        onClick={handleClick}
      >
        {config.label}
      </Badge>
    </Tooltip>
  );
};

// Component to display multiple result badges for a deal
export const ResultBadges = ({ deal }) => {
  const hasClearinghouse = deal.clearinghouse_prediction;
  const hasValuation = deal.valuation_prediction;

  if (!hasClearinghouse && !hasValuation) {
    return <Text fontSize="sm" color="gray.500">No analysis</Text>;
  }

  return (
    <HStack spacing={2}>
      {hasClearinghouse && <ResultBadge deal={deal} type="clearinghouse" />}
      {hasValuation && <ResultBadge deal={deal} type="valuation" />}
    </HStack>
  );
};

export default ResultBadge;