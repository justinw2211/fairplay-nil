import { useState, useEffect, useMemo } from 'react';

const useAnalytics = (deals) => {
  const [dateRange, setDateRange] = useState('30d'); // 7d, 30d, 90d, 1y, all
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate date boundaries
  const getDateBoundary = (range) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  // Filter deals by date range
  const getFilteredDeals = (deals, range) => {
    if (range === 'all') return deals;
    const boundary = getDateBoundary(range);
    return deals.filter(deal => {
      const dealDate = new Date(deal.created_at);
      return dealDate >= boundary;
    });
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const currentDeals = getFilteredDeals(deals, dateRange);
    const previousRange = dateRange === '7d' ? '7d' : dateRange === '30d' ? '30d' : '90d';
    const previousBoundary = getDateBoundary(previousRange);
    const previousDeals = previousBoundary ? 
      deals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        const currentBoundary = getDateBoundary(dateRange);
        return dealDate >= previousBoundary && dealDate < currentBoundary;
      }) : [];

    const current = {
      totalDeals: currentDeals.length,
      totalValue: currentDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0),
      activeDeals: currentDeals.filter(deal => deal.status === 'active' || deal.status === 'Active').length,
      completedDeals: currentDeals.filter(deal => deal.status === 'completed').length,
      draftDeals: currentDeals.filter(deal => deal.status === 'draft').length,
      avgDealValue: currentDeals.length > 0 ? currentDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0) / currentDeals.length : 0,
      completionRate: currentDeals.length > 0 ? (currentDeals.filter(deal => deal.status === 'completed').length / currentDeals.length) * 100 : 0
    };

    const previous = {
      totalDeals: previousDeals.length,
      totalValue: previousDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0),
      activeDeals: previousDeals.filter(deal => deal.status === 'active' || deal.status === 'Active').length,
      completedDeals: previousDeals.filter(deal => deal.status === 'completed').length,
      draftDeals: previousDeals.filter(deal => deal.status === 'draft').length,
      avgDealValue: previousDeals.length > 0 ? previousDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0) / previousDeals.length : 0,
      completionRate: previousDeals.length > 0 ? (previousDeals.filter(deal => deal.status === 'completed').length / previousDeals.length) * 100 : 0
    };

    // Calculate trends (percentage change)
    const getTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current,
      previous,
      trends: {
        totalDeals: getTrend(current.totalDeals, previous.totalDeals),
        totalValue: getTrend(current.totalValue, previous.totalValue),
        activeDeals: getTrend(current.activeDeals, previous.activeDeals),
        completedDeals: getTrend(current.completedDeals, previous.completedDeals),
        avgDealValue: getTrend(current.avgDealValue, previous.avgDealValue),
        completionRate: getTrend(current.completionRate, previous.completionRate)
      }
    };
  }, [deals, dateRange]);

  // Monthly trend data
  const monthlyTrends = useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: date
      });
    }

    return months.map(({ month, date }) => {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate >= monthStart && dealDate <= monthEnd;
      });

      return {
        month,
        deals: monthDeals.length,
        value: monthDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0),
        active: monthDeals.filter(deal => deal.status === 'active' || deal.status === 'Active').length,
        completed: monthDeals.filter(deal => deal.status === 'completed').length
      };
    });
  }, [deals]);

  // Deal type breakdown
  const dealTypeBreakdown = useMemo(() => {
    const currentDeals = getFilteredDeals(deals, dateRange);
    const types = {
      simple: { count: 0, value: 0, color: '#3182CE' },
      clearinghouse: { count: 0, value: 0, color: '#38A169' },
      valuation: { count: 0, value: 0, color: '#D69E2E' }
    };

    currentDeals.forEach(deal => {
      const type = deal.deal_type || 'simple';
      if (types[type]) {
        types[type].count++;
        types[type].value += deal.fmv || 0;
      }
    });

    return Object.entries(types).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: data.count,
      value: data.value,
      color: data.color
    }));
  }, [deals, dateRange]);

  // Compensation ranges
  const compensationRanges = useMemo(() => {
    const currentDeals = getFilteredDeals(deals, dateRange);
    const ranges = {
      '0-1000': 0,
      '1001-5000': 0,
      '5001-10000': 0,
      '10001-25000': 0,
      '25001-50000': 0,
      '50001+': 0
    };

    currentDeals.forEach(deal => {
      const fmv = deal.fmv || 0;
      if (fmv <= 1000) ranges['0-1000']++;
      else if (fmv <= 5000) ranges['1001-5000']++;
      else if (fmv <= 10000) ranges['5001-10000']++;
      else if (fmv <= 25000) ranges['10001-25000']++;
      else if (fmv <= 50000) ranges['25001-50000']++;
      else ranges['50001+']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range: range === '50001+' ? '$50,001+' : `$${range.replace('-', ' - $')}`,
      count,
      color: `hsl(${200 + Object.keys(ranges).indexOf(range) * 30}, 70%, 50%)`
    }));
  }, [deals, dateRange]);

  // Prediction accuracy (for clearinghouse and valuation deals)
  const predictionAccuracy = useMemo(() => {
    const currentDeals = getFilteredDeals(deals, dateRange);
    const predictions = {
      clearinghouse: { total: 0, correct: 0 },
      valuation: { total: 0, correct: 0 }
    };

    currentDeals.forEach(deal => {
      if (deal.deal_type === 'clearinghouse' && deal.clearinghouse_prediction) {
        predictions.clearinghouse.total++;
        // Assuming we have actual results to compare against
        if (deal.clearinghouse_result && deal.clearinghouse_result === deal.clearinghouse_prediction) {
          predictions.clearinghouse.correct++;
        }
      }
      
      if (deal.deal_type === 'valuation' && deal.valuation_range) {
        predictions.valuation.total++;
        // Assuming we have actual compensation to compare against
        if (deal.actual_compensation && deal.valuation_range) {
          const [min, max] = deal.valuation_range.split('-').map(Number);
          if (deal.actual_compensation >= min && deal.actual_compensation <= max) {
            predictions.valuation.correct++;
          }
        }
      }
    });

    return {
      clearinghouse: predictions.clearinghouse.total > 0 ? 
        (predictions.clearinghouse.correct / predictions.clearinghouse.total) * 100 : 0,
      valuation: predictions.valuation.total > 0 ? 
        (predictions.valuation.correct / predictions.valuation.total) * 100 : 0
    };
  }, [deals, dateRange]);

  return {
    kpis,
    monthlyTrends,
    dealTypeBreakdown,
    compensationRanges,
    predictionAccuracy,
    dateRange,
    setDateRange,
    isLoading,
    error,
    // Helper functions
    formatCurrency: (value) => new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value),
    formatPercent: (value) => `${value.toFixed(1)}%`,
    formatTrend: (trend) => `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`
  };
};

export default useAnalytics; 