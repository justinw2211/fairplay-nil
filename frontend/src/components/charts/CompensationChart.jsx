import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@chakra-ui/react';
import { Text, VStack, Box } from '@chakra-ui/react';
import ChartContainer from './ChartContainer';

const CompensationChart = ({ deals = [], height = "400px", onBarClick }) => {
  const theme = useTheme();

  // Process deal data for compensation chart
  const chartData = useMemo(() => {
    if (!deals || deals.length === 0) {return [];}

    // Define compensation ranges
    const ranges = [
      { min: 0, max: 1000, label: '$0-$1K', key: '0-1000' },
      { min: 1000, max: 5000, label: '$1K-$5K', key: '1000-5000' },
      { min: 5000, max: 10000, label: '$5K-$10K', key: '5000-10000' },
      { min: 10000, max: 25000, label: '$10K-$25K', key: '10000-25000' },
      { min: 25000, max: 50000, label: '$25K-$50K', key: '25000-50000' },
      { min: 50000, max: 100000, label: '$50K-$100K', key: '50000-100000' },
      { min: 100000, max: Infinity, label: '$100K+', key: '100000+' }
    ];

    // Initialize range data
    const rangeData = ranges.map(range => ({
      range: range.label,
      key: range.key,
      min: range.min,
      max: range.max,
      count: 0,
      totalValue: 0,
      averageValue: 0,
      simple: 0,
      clearinghouse: 0,
      valuation: 0
    }));

    // Process deals
    deals.forEach(deal => {
      const compensation = deal.fmv || deal.compensation || 0;
      if (compensation <= 0) {return;}

      const range = rangeData.find(r =>
        compensation >= r.min && compensation < r.max
      );

      if (range) {
        range.count++;
        range.totalValue += compensation;

        // Count by deal type
        if (deal.deal_type) {
          range[deal.deal_type]++;
        }
      }
    });

    // Calculate averages and filter out empty ranges
    return rangeData
      .filter(range => range.count > 0)
      .map(range => ({
        ...range,
        averageValue: range.totalValue / range.count
      }));
  }, [deals]);

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
              {label}
            </Text>
            <Text color="brand.textSecondary" fontSize="sm">
              Total Deals: {data.count}
            </Text>
            <Text color="brand.textSecondary" fontSize="sm">
              Total Value: ${data.totalValue.toLocaleString()}
            </Text>
            <Text color="brand.textSecondary" fontSize="sm">
              Average Value: ${Math.round(data.averageValue).toLocaleString()}
            </Text>
            {data.simple > 0 && (
              <Text color="brand.textSecondary" fontSize="sm">
                Simple: {data.simple}
              </Text>
            )}
            {data.clearinghouse > 0 && (
              <Text color="brand.textSecondary" fontSize="sm">
                Clearinghouse: {data.clearinghouse}
              </Text>
            )}
            {data.valuation > 0 && (
              <Text color="brand.textSecondary" fontSize="sm">
                Valuation: {data.valuation}
              </Text>
            )}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  const handleBarClick = (data, index) => {
    if (onBarClick) {
      onBarClick(data, index);
    }
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer
        title="Compensation Analysis"
        subtitle="Distribution of deals by compensation range"
        height={height}
      >
        <VStack justify="center" align="center" h="full">
          <Text color="brand.textSecondary">No compensation data available to display</Text>
        </VStack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Compensation Analysis"
      subtitle="Distribution of deals by compensation range"
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.charts?.grid || '#f4f4f4'}
          />
          <XAxis
            dataKey="range"
            tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
            axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
            axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="count"
            fill={theme.colors.charts?.primary || '#d0bdb5'}
            name="Deal Count"
            onClick={handleBarClick}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CompensationChart;