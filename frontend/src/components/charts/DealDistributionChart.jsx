import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@chakra-ui/react';
import { Text, VStack, HStack, Box } from '@chakra-ui/react';
import ChartContainer from './ChartContainer';

const DealDistributionChart = ({ deals = [], height = "400px", onSegmentClick }) => {
  const theme = useTheme();

  // Process deal data for pie chart
  const chartData = useMemo(() => {
    if (!deals || deals.length === 0) {return [];}

    const dealTypes = {
      simple: { count: 0, label: 'Simple Deal', color: theme.colors.charts?.series?.[0] || '#d0bdb5' },
      clearinghouse: { count: 0, label: 'Clearinghouse', color: theme.colors.charts?.series?.[1] || '#4e6a7b' },
      valuation: { count: 0, label: 'Valuation', color: theme.colors.charts?.series?.[2] || '#d6dce4' }
    };

    deals.forEach(deal => {
      if (deal.deal_type && dealTypes[deal.deal_type]) {
        dealTypes[deal.deal_type].count++;
      }
    });

    return Object.entries(dealTypes)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        name: data.label,
        value: data.count,
        color: data.color,
        type: type,
        percentage: ((data.count / deals.length) * 100).toFixed(1)
      }));
  }, [deals, theme]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" color="brand.textPrimary">
              {data.name}
            </Text>
            <Text color="brand.textSecondary">
              Count: {data.value}
            </Text>
            <Text color="brand.textSecondary">
              Percentage: {data.percentage}%
            </Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }) => {
    return (
      <VStack spacing={2} align="start" mt={4}>
        {payload.map((entry, index) => (
          <HStack key={index} spacing={2}>
            <Box
              w={3}
              h={3}
              bg={entry.color}
              borderRadius="sm"
            />
            <Text fontSize="sm" color="brand.textSecondary">
              {entry.value} ({entry.payload.percentage}%)
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  };

  const handlePieClick = (data, index) => {
    if (onSegmentClick) {
      onSegmentClick(data.type, data);
    }
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer
        title="Deal Distribution"
        subtitle="Distribution of deals by type"
        height={height}
      >
        <VStack justify="center" align="center" h="full">
          <Text color="brand.textSecondary">No deals available to display</Text>
        </VStack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Deal Distribution"
      subtitle="Distribution of deals by type"
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={handlePieClick}
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DealDistributionChart;