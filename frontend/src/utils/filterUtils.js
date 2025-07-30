/**
 * Main function to filter deals based on provided filters
 * @param {Array} deals - Array of deal objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered deals array
 */
export const filterDeals = (deals, filters) => {
  if (!deals || !Array.isArray(deals)) {return [];}
  if (!filters) {return deals;}

  return deals.filter(deal => {
    // Search filter
    if (filters.search && !matchesSearch(deal, filters.search)) {
      return false;
    }

    // Deal type filter
    if (filters.dealTypes && filters.dealTypes.length > 0 && !filters.dealTypes.includes(deal.deal_type)) {
      return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(deal.status)) {
      return false;
    }

    // Schools filter
    if (filters.schools && filters.schools.length > 0 && deal.school && !filters.schools.includes(deal.school)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
      if (!matchesDateRange(deal, filters.dateRange)) {
        return false;
      }
    }

    // FMV range filter
    if (filters.fmvRange && !matchesFMVRange(deal, filters.fmvRange)) {
      return false;
    }

    // Analysis results filter
    if (filters.analysisResults && filters.analysisResults.length > 0) {
      if (!matchesAnalysisResults(deal, filters.analysisResults)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Check if deal matches search term
 * @param {Object} deal - Deal object
 * @param {string} searchTerm - Search term
 * @returns {boolean} Whether deal matches search
 */
const matchesSearch = (deal, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {return true;}

  const term = searchTerm.toLowerCase().trim();
  const searchFields = [
    deal.brand_partner,
    deal.payor_name,
    deal.school,
    deal.athlete_name,
    deal.description,
    deal.deal_type,
    deal.status,
    deal.clearinghouse_prediction,
    deal.valuation_prediction
  ];

  return searchFields.some(field =>
    field && field.toString().toLowerCase().includes(term)
  );
};

/**
 * Check if deal falls within date range
 * @param {Object} deal - Deal object
 * @param {Object} dateRange - Date range with startDate and endDate
 * @returns {boolean} Whether deal falls within range
 */
const matchesDateRange = (deal, dateRange) => {
  const { startDate, endDate } = dateRange;
  if (!startDate || !endDate) {return true;}

  const dealDate = new Date(deal.created_at || deal.updated_at);
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set end date to end of day
  end.setHours(23, 59, 59, 999);

  return dealDate >= start && dealDate <= end;
};

/**
 * Check if deal FMV falls within range
 * @param {Object} deal - Deal object
 * @param {Array} fmvRange - Array with [min, max] values
 * @returns {boolean} Whether deal FMV falls within range
 */
const matchesFMVRange = (deal, fmvRange) => {
  if (!fmvRange || fmvRange.length !== 2) {return true;}

  const dealFMV = deal.fmv || deal.compensation || 0;
  const [min, max] = fmvRange;

  return dealFMV >= min && dealFMV <= max;
};

/**
 * Check if deal has matching analysis results
 * @param {Object} deal - Deal object
 * @param {Array} analysisResults - Array of analysis result strings
 * @returns {boolean} Whether deal has matching analysis results
 */
const matchesAnalysisResults = (deal, analysisResults) => {
  if (!analysisResults || analysisResults.length === 0) {return true;}

  const dealResults = [
    deal.clearinghouse_prediction,
    deal.valuation_prediction
  ].filter(Boolean);

  return analysisResults.some(result =>
    dealResults.some(dealResult =>
      dealResult.toLowerCase().includes(result.toLowerCase())
    )
  );
};

/**
 * Sort deals based on provided sort configuration
 * @param {Array} deals - Array of deals to sort
 * @param {Object} sortConfig - Sort configuration with key and direction
 * @returns {Array} Sorted deals array
 */
export const sortDeals = (deals, sortConfig) => {
  if (!deals || !Array.isArray(deals) || !sortConfig || !sortConfig.key) {
    return deals;
  }

  const { key, direction } = sortConfig;

  return [...deals].sort((a, b) => {
    let aValue = getNestedValue(a, key);
    let bValue = getNestedValue(b, key);

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) {aValue = '';}
    if (bValue === null || bValue === undefined) {bValue = '';}

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle dates
    if (key.includes('date') || key.includes('created') || key.includes('updated')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle numbers
    if (key === 'fmv' || key === 'compensation') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return direction === 'ascending' ? comparison : -comparison;
  });
};

/**
 * Get nested object value by key path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-separated path to value
 * @returns {*} Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Get unique values for a specific field across all deals
 * @param {Array} deals - Array of deals
 * @param {string} field - Field name to extract values from
 * @returns {Array} Array of unique values
 */
export const getUniqueValues = (deals, field) => {
  if (!deals || !Array.isArray(deals)) {return [];}

  const values = deals
    .map(deal => getNestedValue(deal, field))
    .filter(value => value !== null && value !== undefined && value !== '');

  return [...new Set(values)].sort();
};

/**
 * Get filter statistics for display
 * @param {Array} originalDeals - Original unfiltered deals
 * @param {Array} filteredDeals - Filtered deals
 * @param {Object} filters - Current filters
 * @returns {Object} Statistics object
 */
export const getFilterStats = (originalDeals, filteredDeals, filters) => {
  const totalDeals = originalDeals ? originalDeals.length : 0;
  const filteredCount = filteredDeals ? filteredDeals.length : 0;
  const hiddenCount = totalDeals - filteredCount;
  const percentageVisible = totalDeals > 0 ? ((filteredCount / totalDeals) * 100).toFixed(1) : 0;

  return {
    total: totalDeals,
    visible: filteredCount,
    hidden: hiddenCount,
    percentageVisible: parseFloat(percentageVisible),
    hasFilters: filters && Object.values(filters).some(value => {
      if (Array.isArray(value)) {return value.length > 0;}
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined);
      }
      return value !== null && value !== undefined && value !== '';
    })
  };
};

/**
 * Create a filter summary string for display
 * @param {Object} filters - Current filters
 * @returns {string} Summary string
 */
export const createFilterSummary = (filters) => {
  if (!filters) {return '';}

  const parts = [];

  if (filters.search && filters.search.trim()) {
    parts.push(`"${filters.search}"`);
  }

  if (filters.dealTypes && filters.dealTypes.length > 0) {
    parts.push(`${filters.dealTypes.join(', ')}`);
  }

  if (filters.statuses && filters.statuses.length > 0) {
    parts.push(`Status: ${filters.statuses.join(', ')}`);
  }

  if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
    const start = new Date(filters.dateRange.startDate).toLocaleDateString();
    const end = new Date(filters.dateRange.endDate).toLocaleDateString();
    parts.push(`${start} - ${end}`);
  }

  return parts.join(' • ');
};

/**
 * Export filtered results to CSV format
 * @param {Array} deals - Array of deals to export
 * @param {Array} columns - Array of column configurations
 * @returns {string} CSV string
 */
export const exportToCSV = (deals, columns = []) => {
  if (!deals || deals.length === 0) {return '';}

  const defaultColumns = [
    { key: 'brand_partner', label: 'Brand Partner' },
    { key: 'deal_type', label: 'Deal Type' },
    { key: 'status', label: 'Status' },
    { key: 'fmv', label: 'FMV' },
    { key: 'school', label: 'School' },
    { key: 'created_at', label: 'Created Date' }
  ];

  const columnsToUse = columns.length > 0 ? columns : defaultColumns;

  // Create header row
  const headers = columnsToUse.map(col => col.label);

  // Create data rows
  const rows = deals.map(deal =>
    columnsToUse.map(col => {
      const value = getNestedValue(deal, col.key);
      if (value === null || value === undefined) {return '';}

      // Handle dates
      if (col.key.includes('date') || col.key.includes('created') || col.key.includes('updated')) {
        return new Date(value).toLocaleDateString();
      }

      // Handle numbers
      if (col.key === 'fmv' || col.key === 'compensation') {
        return typeof value === 'number' ? value.toFixed(2) : value;
      }

      // Escape commas and quotes for CSV
      const stringValue = value.toString();
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    })
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};