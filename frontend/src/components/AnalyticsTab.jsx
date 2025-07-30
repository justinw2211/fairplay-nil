import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Button,
  ButtonGroup,
  Select,
  Flex,
  Spacer,
  Badge,
  Icon,
  useColorModeValue,
  useToast,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import {
  FiDownload,
  FiCalendar,
  FiBarChart,
  FiTrendingUp,
  FiPieChart,
  FiTarget,
  FiDollarSign,
  FiActivity,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import useAnalytics from '../hooks/useAnalytics';
import KPICard, {
  CurrencyKPICard,
  PercentageKPICard,
  CountKPICard,
  ActivityKPICard,
  CompletionKPICard,
  PendingKPICard
} from './KPICard';
import ChartContainer from './charts/ChartContainer';
import { DealDistributionChart, TrendChart, CompensationChart, PredictionChart } from './charts';
import {
  exportKpiReport,
  exportMonthlyTrendsReport,
  exportDealTypeBreakdownReport,
  exportCompensationRangesReport,
  exportPredictionAccuracyReport,
  exportComprehensiveReport,
  exportDealsReport
} from '../utils/exportUtils';

const AnalyticsTab = ({ deals }) => {
  const {
    kpis,
    monthlyTrends,
    dealTypeBreakdown,
    compensationRanges,
    predictionAccuracy,
    dateRange,
    setDateRange,
    isLoading,
    error,
    formatCurrency,
    formatPercent,
    formatTrend
  } = useAnalytics(deals);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleExport = (type) => {
    try {
      const analyticsData = {
        kpis,
        monthlyTrends,
        dealTypeBreakdown,
        compensationRanges,
        predictionAccuracy
      };

      switch (type) {
        case 'kpi':
          exportKpiReport(kpis, dateRange);
          break;
        case 'trends':
          exportMonthlyTrendsReport(monthlyTrends);
          break;
        case 'dealTypes':
          exportDealTypeBreakdownReport(dealTypeBreakdown, dateRange);
          break;
        case 'compensation':
          exportCompensationRangesReport(compensationRanges, dateRange);
          break;
        case 'predictions':
          exportPredictionAccuracyReport(predictionAccuracy, dateRange);
          break;
        case 'comprehensive':
          exportComprehensiveReport(analyticsData, deals, dateRange);
          break;
        case 'deals':
          exportDealsReport(deals, dateRange);
          break;
        default:
          exportComprehensiveReport(analyticsData, deals, dateRange);
      }

      toast({
        title: 'Export Successful',
        description: `Your ${type} report has been downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your report.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  const KPISection = () => (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="brand.textPrimary">Key Performance Indicators</Heading>
          <Text color="brand.textSecondary" fontSize="sm">
            Overview of your deal performance with period-over-period comparisons
          </Text>
        </Box>
        <HStack>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="sm"
            minW="150px"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            onClick={() => handleExport('kpi')}
          >
            Export KPIs
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={4}>
        <CurrencyKPICard
          title="Total Value"
          value={kpis.current.totalValue}
          previousValue={kpis.previous.totalValue}
          trend={kpis.trends.totalValue}
          helpText="Total value of all deals in selected period"
        />

        <CountKPICard
          title="Total Deals"
          value={kpis.current.totalDeals}
          previousValue={kpis.previous.totalDeals}
          trend={kpis.trends.totalDeals}
          helpText="Number of deals created in selected period"
        />

        <ActivityKPICard
          title="Active Deals"
          value={kpis.current.activeDeals}
          previousValue={kpis.previous.activeDeals}
          trend={kpis.trends.activeDeals}
          helpText="Currently active deals"
        />

        <CompletionKPICard
          title="Completed"
          value={kpis.current.completedDeals}
          total={kpis.current.totalDeals}
          previousValue={kpis.previous.completedDeals}
          trend={kpis.trends.completedDeals}
          helpText="Successfully completed deals"
        />

        <CurrencyKPICard
          title="Average Value"
          value={kpis.current.avgDealValue}
          previousValue={kpis.previous.avgDealValue}
          trend={kpis.trends.avgDealValue}
          helpText="Average deal value in selected period"
        />

        <PendingKPICard
          title="Draft Deals"
          value={kpis.current.draftDeals}
          previousValue={kpis.previous.draftDeals}
          trend={kpis.trends.draftDeals}
          helpText="Deals in draft status"
        />
      </SimpleGrid>
    </VStack>
  );

  const TrendsSection = () => (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="brand.textPrimary">Performance Trends</Heading>
          <Text color="brand.textSecondary" fontSize="sm">
            Monthly trends and performance analysis over time
          </Text>
        </Box>
        <Button
          size="sm"
          leftIcon={<FiDownload />}
          colorScheme="blue"
          variant="outline"
          onClick={() => handleExport('trends')}
        >
          Export Trends
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ChartContainer
          title="Monthly Deal Trends"
          subtitle="Number of deals created each month"
          height="350px"
        >
          <TrendChart
            data={monthlyTrends}
            xKey="month"
            yKeys={['deals', 'active', 'completed']}
            colors={['#3182CE', '#38A169', '#D69E2E']}
          />
        </ChartContainer>

        <ChartContainer
          title="Monthly Value Trends"
          subtitle="Total deal value created each month"
          height="350px"
        >
          <TrendChart
            data={monthlyTrends}
            xKey="month"
            yKeys={['value']}
            colors={['#38A169']}
            formatTooltip={(value) => formatCurrency(value)}
          />
        </ChartContainer>
      </SimpleGrid>
    </VStack>
  );

  const DistributionSection = () => (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="brand.textPrimary">Deal Distribution</Heading>
          <Text color="brand.textSecondary" fontSize="sm">
            Breakdown of deals by type and compensation ranges
          </Text>
        </Box>
        <ButtonGroup size="sm">
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            onClick={() => handleExport('dealTypes')}
          >
            Export Types
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            onClick={() => handleExport('compensation')}
          >
            Export Compensation
          </Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ChartContainer
          title="Deal Type Distribution"
          subtitle="Breakdown of deals by type"
          height="350px"
        >
          <DealDistributionChart
            data={dealTypeBreakdown.map(item => ({
              name: item.type,
              value: item.count,
              color: item.color
            }))}
          />
        </ChartContainer>

        <ChartContainer
          title="Compensation Ranges"
          subtitle="Distribution of deals by compensation amount"
          height="350px"
        >
          <CompensationChart
            data={compensationRanges.map(item => ({
              range: item.range,
              count: item.count,
              color: item.color
            }))}
          />
        </ChartContainer>
      </SimpleGrid>
    </VStack>
  );

  const PredictionSection = () => (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="brand.textPrimary">Prediction Accuracy</Heading>
          <Text color="brand.textSecondary" fontSize="sm">
            How accurate are our clearinghouse and valuation predictions?
          </Text>
        </Box>
        <Button
          size="sm"
          leftIcon={<FiDownload />}
          colorScheme="blue"
          variant="outline"
          onClick={() => handleExport('predictions')}
        >
          Export Predictions
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <KPICard
          title="Clearinghouse Accuracy"
          value={`${predictionAccuracy.clearinghouse.toFixed(1)}%`}
          icon={FiTarget}
          color="green.500"
          helpText="Accuracy of clearinghouse approval predictions"
          showProgress={true}
          progressValue={predictionAccuracy.clearinghouse}
        />

        <KPICard
          title="Valuation Accuracy"
          value={`${predictionAccuracy.valuation.toFixed(1)}%`}
          icon={FiTarget}
          color="blue.500"
          helpText="Accuracy of deal valuation predictions"
          showProgress={true}
          progressValue={predictionAccuracy.valuation}
        />
      </SimpleGrid>

      <ChartContainer
        title="Prediction Performance"
        subtitle="Accuracy comparison between prediction types"
        height="300px"
      >
        <PredictionChart
          data={[
            { name: 'Clearinghouse', value: predictionAccuracy.clearinghouse },
            { name: 'Valuation', value: predictionAccuracy.valuation }
          ]}
          mode="bar"
        />
      </ChartContainer>
    </VStack>
  );

  if (error) {
    return (
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <VStack spacing={4}>
            <Text color="red.500">Error loading analytics data</Text>
            <Text color="brand.textSecondary">{error}</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading as="h2" size="lg" color="brand.textPrimary">
            Analytics Dashboard
          </Heading>
          <Text color="brand.textSecondary" mt={1}>
            Comprehensive insights into your deal performance and trends
          </Text>
        </Box>
        <ButtonGroup>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
            onClick={() => handleExport('comprehensive')}
          >
            Export All Data
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="outline"
            onClick={() => handleExport('deals')}
          >
            Export Deals
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Summary Stats */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <HStack>
            <Icon as={FiBarChart} color="brand.accentPrimary" />
            <Text fontWeight="semibold">Quick Stats</Text>
            <Spacer />
            <Badge colorScheme="blue" variant="subtle">
              {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                {kpis.current.totalDeals}
              </Text>
              <Text fontSize="sm" color="brand.textSecondary">Total Deals</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                {formatCurrency(kpis.current.totalValue)}
              </Text>
              <Text fontSize="sm" color="brand.textSecondary">Total Value</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                {formatCurrency(kpis.current.avgDealValue)}
              </Text>
              <Text fontSize="sm" color="brand.textSecondary">Average Value</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                {formatPercent(kpis.current.completionRate)}
              </Text>
              <Text fontSize="sm" color="brand.textSecondary">Completion Rate</Text>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>KPIs</Tab>
          <Tab>Trends</Tab>
          <Tab>Distribution</Tab>
          <Tab>Predictions</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <KPISection />
          </TabPanel>
          <TabPanel px={0}>
            <TrendsSection />
          </TabPanel>
          <TabPanel px={0}>
            <DistributionSection />
          </TabPanel>
          <TabPanel px={0}>
            <PredictionSection />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default AnalyticsTab;