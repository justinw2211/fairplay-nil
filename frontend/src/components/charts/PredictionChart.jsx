import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@chakra-ui/react';
import { Text, VStack, Box, HStack, Switch, FormLabel } from '@chakra-ui/react';
import ChartContainer from './ChartContainer';

const PredictionChart = ({ deals = [], height = "400px", onPredictionClick, showPieChart = false }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = React.useState(showPieChart ? 'pie' : 'bar');
  
  // Process deal data for prediction chart
  const chartData = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    // Filter deals with predictions
    const dealsWithPredictions = deals.filter(deal => 
      deal.clearinghouse_prediction || deal.valuation_prediction
    );
    
    if (dealsWithPredictions.length === 0) return [];
    
    // Group by prediction results
    const predictionStats = {
      clearinghouse: {
        approved: 0,
        denied: 0,
        flagged: 0,
        pending: 0,
        total: 0
      },
      valuation: {
        high: 0,
        medium: 0,
        low: 0,
        total: 0
      }
    };
    
    dealsWithPredictions.forEach(deal => {
      // Clearinghouse predictions
      if (deal.clearinghouse_prediction) {
        predictionStats.clearinghouse.total++;
        const prediction = deal.clearinghouse_prediction.toLowerCase();
        if (prediction.includes('approved')) {
          predictionStats.clearinghouse.approved++;
        } else if (prediction.includes('denied')) {
          predictionStats.clearinghouse.denied++;
        } else if (prediction.includes('flagged')) {
          predictionStats.clearinghouse.flagged++;
        } else {
          predictionStats.clearinghouse.pending++;
        }
      }
      
      // Valuation predictions
      if (deal.valuation_prediction) {
        predictionStats.valuation.total++;
        const prediction = deal.valuation_prediction.toLowerCase();
        if (prediction.includes('high')) {
          predictionStats.valuation.high++;
        } else if (prediction.includes('medium')) {
          predictionStats.valuation.medium++;
        } else if (prediction.includes('low')) {
          predictionStats.valuation.low++;
        }
      }
    });
    
    // Create chart data
    const barData = [];
    
    if (predictionStats.clearinghouse.total > 0) {
      barData.push({
        category: 'Clearinghouse',
        approved: predictionStats.clearinghouse.approved,
        denied: predictionStats.clearinghouse.denied,
        flagged: predictionStats.clearinghouse.flagged,
        pending: predictionStats.clearinghouse.pending,
        total: predictionStats.clearinghouse.total
      });
    }
    
    if (predictionStats.valuation.total > 0) {
      barData.push({
        category: 'Valuation',
        high: predictionStats.valuation.high,
        medium: predictionStats.valuation.medium,
        low: predictionStats.valuation.low,
        total: predictionStats.valuation.total
      });
    }
    
    // Create pie data for clearinghouse
    const pieData = [];
    if (predictionStats.clearinghouse.total > 0) {
      [
        { name: 'Approved', value: predictionStats.clearinghouse.approved, color: '#10B981' },
        { name: 'Denied', value: predictionStats.clearinghouse.denied, color: '#EF4444' },
        { name: 'Flagged', value: predictionStats.clearinghouse.flagged, color: '#F59E0B' },
        { name: 'Pending', value: predictionStats.clearinghouse.pending, color: '#6B7280' }
      ].forEach(item => {
        if (item.value > 0) {
          pieData.push({
            ...item,
            percentage: ((item.value / predictionStats.clearinghouse.total) * 100).toFixed(1)
          });
        }
      });
    }
    
    return { barData, pieData, predictionStats };
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
                {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
              </Text>
            ))}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  const handlePredictionClick = (data, index) => {
    if (onPredictionClick) {
      onPredictionClick(data, index);
    }
  };

  if (!chartData.barData || chartData.barData.length === 0) {
    return (
      <ChartContainer
        title="Prediction Success Rates"
        subtitle="Analysis of prediction accuracy and outcomes"
        height={height}
      >
        <VStack justify="center" align="center" h="full">
          <Text color="brand.textSecondary">No prediction data available to display</Text>
        </VStack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Prediction Success Rates"
      subtitle="Analysis of prediction accuracy and outcomes"
      height={height}
    >
      <VStack spacing={4}>
        {/* View Mode Toggle */}
        <HStack spacing={4}>
          <FormLabel htmlFor="view-mode" mb={0} fontSize="sm" color="brand.textSecondary">
            View Mode:
          </FormLabel>
          <Switch
            id="view-mode"
            isChecked={viewMode === 'pie'}
            onChange={() => setViewMode(viewMode === 'bar' ? 'pie' : 'bar')}
            colorScheme="brand"
          />
          <Text fontSize="sm" color="brand.textSecondary">
            {viewMode === 'pie' ? 'Pie Chart' : 'Bar Chart'}
          </Text>
        </HStack>
        
        {/* Chart */}
        <Box w="full" h={height}>
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'bar' ? (
              <BarChart
                data={chartData.barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.colors.charts?.grid || '#f4f4f4'} 
                />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
                  axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
                />
                <YAxis 
                  tick={{ fill: theme.colors.charts?.text || '#282f3d', fontSize: 12 }}
                  axisLine={{ stroke: theme.colors.charts?.grid || '#f4f4f4' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="approved" fill="#10B981" name="Approved" onClick={handlePredictionClick} />
                <Bar dataKey="denied" fill="#EF4444" name="Denied" onClick={handlePredictionClick} />
                <Bar dataKey="flagged" fill="#F59E0B" name="Flagged" onClick={handlePredictionClick} />
                <Bar dataKey="pending" fill="#6B7280" name="Pending" onClick={handlePredictionClick} />
                <Bar dataKey="high" fill="#10B981" name="High Value" onClick={handlePredictionClick} />
                <Bar dataKey="medium" fill="#F59E0B" name="Medium Value" onClick={handlePredictionClick} />
                <Bar dataKey="low" fill="#EF4444" name="Low Value" onClick={handlePredictionClick} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePredictionClick}
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Box>
      </VStack>
    </ChartContainer>
  );
};

export default PredictionChart; 