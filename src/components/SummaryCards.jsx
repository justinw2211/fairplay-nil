// src/components/SummaryCards.jsx
import React from 'react';
import { SimpleGrid, Box, Text, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

const SummaryCards = ({ deals }) => {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.fmv || 0), 0);
  const activeDeals = deals.filter(deal => deal.status === 'Active').length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="lg">
        <StatLabel>Total Value of Deals</StatLabel>
        <StatNumber fontSize="4xl">{formatCurrency(totalValue)}</StatNumber>
      </Stat>
      <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="lg">
        <StatLabel>Active Deals</StatLabel>
        <StatNumber fontSize="4xl">{activeDeals}</StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

export default SummaryCards;