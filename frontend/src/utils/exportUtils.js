// Export utilities for analytics data
export const exportToCsv = (data, filename) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const convertToCSV = (data) => {
  if (!data || data.length === 0) {return '';}

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

export const exportDealsReport = (deals, dateRange) => {
  const reportData = deals.map(deal => ({
    'Deal ID': deal.id,
    'Brand Partner': deal.brand_partner || 'N/A',
    'Deal Type': deal.deal_type || 'simple',
    'Status': deal.status || 'draft',
    'FMV': deal.fmv || 0,
    'Created Date': new Date(deal.created_at).toLocaleDateString(),
    'University': deal.university || 'N/A',
    'Sport': deal.sport || 'N/A',
    'Clearinghouse Prediction': deal.clearinghouse_prediction || 'N/A',
    'Clearinghouse Result': deal.clearinghouse_result || 'N/A',
    'Valuation Range': deal.valuation_range || 'N/A'
  }));

  const filename = `deals_report_${dateRange}_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportKpiReport = (kpis, dateRange) => {
  const reportData = [
    {
      'Metric': 'Total Deals',
      'Current': kpis.current.totalDeals,
      'Previous': kpis.previous.totalDeals,
      'Trend': `${kpis.trends.totalDeals.toFixed(1)}%`
    },
    {
      'Metric': 'Total Value',
      'Current': `$${kpis.current.totalValue.toLocaleString()}`,
      'Previous': `$${kpis.previous.totalValue.toLocaleString()}`,
      'Trend': `${kpis.trends.totalValue.toFixed(1)}%`
    },
    {
      'Metric': 'Active Deals',
      'Current': kpis.current.activeDeals,
      'Previous': kpis.previous.activeDeals,
      'Trend': `${kpis.trends.activeDeals.toFixed(1)}%`
    },
    {
      'Metric': 'Completed Deals',
      'Current': kpis.current.completedDeals,
      'Previous': kpis.previous.completedDeals,
      'Trend': `${kpis.trends.completedDeals.toFixed(1)}%`
    },
    {
      'Metric': 'Average Deal Value',
      'Current': `$${kpis.current.avgDealValue.toLocaleString()}`,
      'Previous': `$${kpis.previous.avgDealValue.toLocaleString()}`,
      'Trend': `${kpis.trends.avgDealValue.toFixed(1)}%`
    },
    {
      'Metric': 'Completion Rate',
      'Current': `${kpis.current.completionRate.toFixed(1)}%`,
      'Previous': `${kpis.previous.completionRate.toFixed(1)}%`,
      'Trend': `${kpis.trends.completionRate.toFixed(1)}%`
    }
  ];

  const filename = `kpi_report_${dateRange}_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportMonthlyTrendsReport = (monthlyTrends) => {
  const reportData = monthlyTrends.map(month => ({
    'Month': month.month,
    'Total Deals': month.deals,
    'Total Value': `$${month.value.toLocaleString()}`,
    'Active Deals': month.active,
    'Completed Deals': month.completed,
    'Average Deal Value': month.deals > 0 ? `$${(month.value / month.deals).toLocaleString()}` : '$0'
  }));

  const filename = `monthly_trends_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportDealTypeBreakdownReport = (dealTypeBreakdown, dateRange) => {
  const reportData = dealTypeBreakdown.map(type => ({
    'Deal Type': type.type,
    'Count': type.count,
    'Total Value': `$${type.value.toLocaleString()}`,
    'Average Value': type.count > 0 ? `$${(type.value / type.count).toLocaleString()}` : '$0'
  }));

  const filename = `deal_type_breakdown_${dateRange}_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportCompensationRangesReport = (compensationRanges, dateRange) => {
  const reportData = compensationRanges.map(range => ({
    'Compensation Range': range.range,
    'Deal Count': range.count,
    'Percentage': compensationRanges.length > 0 ?
      `${((range.count / compensationRanges.reduce((sum, r) => sum + r.count, 0)) * 100).toFixed(1)}%` : '0%'
  }));

  const filename = `compensation_ranges_${dateRange}_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportPredictionAccuracyReport = (predictionAccuracy, dateRange) => {
  const reportData = [
    {
      'Prediction Type': 'Clearinghouse',
      'Accuracy': `${predictionAccuracy.clearinghouse.toFixed(1)}%`
    },
    {
      'Prediction Type': 'Valuation',
      'Accuracy': `${predictionAccuracy.valuation.toFixed(1)}%`
    }
  ];

  const filename = `prediction_accuracy_${dateRange}_${new Date().toISOString().split('T')[0]}`;
  exportToCsv(reportData, filename);
};

export const exportComprehensiveReport = (analyticsData, deals, dateRange) => {
  const { kpis, monthlyTrends, dealTypeBreakdown, compensationRanges, predictionAccuracy } = analyticsData;

  // Create a comprehensive report with multiple sheets worth of data
  const report = {
    summary: {
      'Report Generated': new Date().toLocaleString(),
      'Date Range': dateRange,
      'Total Deals': kpis.current.totalDeals,
      'Total Value': `$${kpis.current.totalValue.toLocaleString()}`,
      'Active Deals': kpis.current.activeDeals,
      'Completed Deals': kpis.current.completedDeals,
      'Draft Deals': kpis.current.draftDeals,
      'Average Deal Value': `$${kpis.current.avgDealValue.toLocaleString()}`,
      'Completion Rate': `${kpis.current.completionRate.toFixed(1)}%`
    },
    trends: kpis.trends,
    monthlyData: monthlyTrends,
    dealTypes: dealTypeBreakdown,
    compensationRanges: compensationRanges,
    predictionAccuracy: predictionAccuracy
  };

  // Export as JSON for comprehensive data
  const jsonContent = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comprehensive_analytics_report_${dateRange}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper function to format data for different export types
export const formatDataForExport = (data, type) => {
  switch (type) {
    case 'currency':
      return typeof data === 'number' ? `$${data.toLocaleString()}` : data;
    case 'percentage':
      return typeof data === 'number' ? `${data.toFixed(1)}%` : data;
    case 'date':
      return data instanceof Date ? data.toLocaleDateString() : data;
    case 'trend':
      return typeof data === 'number' ? `${data >= 0 ? '+' : ''}${data.toFixed(1)}%` : data;
    default:
      return data;
  }
};

// Generate summary statistics for export
export const generateSummaryStats = (deals) => {
  const stats = {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + (deal.fmv || 0), 0),
    activeDeals: deals.filter(deal => deal.status === 'active' || deal.status === 'Active').length,
    completedDeals: deals.filter(deal => deal.status === 'completed').length,
    draftDeals: deals.filter(deal => deal.status === 'draft').length,
    avgDealValue: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.fmv || 0), 0) / deals.length : 0,
    completionRate: deals.length > 0 ? (deals.filter(deal => deal.status === 'completed').length / deals.length) * 100 : 0
  };

  return stats;
};