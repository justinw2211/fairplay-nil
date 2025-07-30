import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@chakra-ui/react';
import { Text, VStack, Box } from '@chakra-ui/react';
import ChartContainer from './ChartContainer';

const TrendChart = ({ deals = [], height = "400px", onDataPointClick }) => {
  const theme = useTheme();

  // Process deal data for trend chart
  const chartData = useMemo(() => {
    if (!deals || deals.length === 0) {return [];}

    // Group deals by month
    const monthlyData = {};

    deals.forEach(deal => {
      const dealDate = deal.created_at || deal.updated_at;
      if (!dealDate) {return;}

      const date = new Date(dealDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          monthKey: monthKey,
          total: 0,
          simple: 0,
          clearinghouse: 0,
          valuation: 0,
          active: 0,
          completed: 0,
          draft: 0
        };
      }

      monthlyData[monthKey].total++;

      // Count by deal type
      if (deal.deal_type) {
        monthlyData[monthKey][deal.deal_type]++;
      }

      // Count by status
      if (deal.status) {
        const status = deal.status.toLowerCase();
        if (status === 'active') {monthlyData[monthKey].active++;}
        else if (status === 'completed') {monthlyData[monthKey].completed++;}
        else if (status === 'draft') {monthlyData[monthKey].draft++;}
      }
    });

    // Sort by month and return array
    return Object.values(monthlyData)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-12); // Show last 12 months
  }, [deals]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            {payload.map((entry, index) => (
              <Text key={index} color={entry.color} fontSize="sm">
                {entry.name}: {entry.value}
              </Text>
            ))}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  const handleDataPointClick = (data, index) => {
    if (onDataPointClick) {
      onDataPointClick(data, index);
    }
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer
        title="Deal Trends"
        subtitle="Monthly deal activity over time"
        height={height}
      >
        <VStack justify="center" align="center" h="full">
          <Text color="brand.textSecondary">No trend data available to display</Text>
        </VStack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Deal Trends"
      subtitle="Monthly deal activity over time"
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.colors.charts?.grid || '#f4f4f4'}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
            axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
          />
          <YAxis
            tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
            axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke={theme.colors.charts?.primary || '#d0bdb5'}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6, onClick: handleDataPointClick }}
            name="Total Deals"
          />
          <Line
            type="monotone"
            dataKey="active"
            stroke={theme.colors.charts?.series?.[1] || '#4e6a7b'}
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Active"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={theme.colors.charts?.series?.[2] || '#d6dce4'}
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TrendChart;