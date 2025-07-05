import { useState, useEffect, useCallback, useMemo } from 'react';
import { filterDeals } from '../utils/filterUtils';

const FILTER_STORAGE_KEY = 'dashboardFilters';

const defaultFilters = {
  search: '',
  dealTypes: [],
  statuses: [],
  schools: [],
  dateRange: {
    startDate: null,
    endDate: null
  },
  fmvRange: [0, 100000],
  analysisResults: []
};

export const useFilters = (deals = []) => {
  const [filters, setFilters] = useState(() => {
    // Load filters from localStorage on initialization
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const parsedFilters = JSON.parse(saved);
        // Merge with defaults to ensure all keys exist
        return { ...defaultFilters, ...parsedFilters };
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return defaultFilters;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);

  // Filtered deals based on current filters
  const filteredDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];
    
    setIsLoading(true);
    try {
      const result = filterDeals(deals, filters);
      return result;
    } catch (error) {
      console.error('Error filtering deals:', error);
      return deals;
    } finally {
      // Use setTimeout to prevent blocking UI
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [deals, filters]);

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(defaultFilters[key]) ? [] : 
             typeof defaultFilters[key] === 'object' ? { ...defaultFilters[key] } :
             defaultFilters[key]
    }));
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search && filters.search.trim()) count++;
    if (filters.dealTypes && filters.dealTypes.length > 0) count++;
    if (filters.statuses && filters.statuses.length > 0) count++;
    if (filters.schools && filters.schools.length > 0) count++;
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) count++;
    if (filters.fmvRange && (filters.fmvRange[0] > 0 || filters.fmvRange[1] < 100000)) count++;
    if (filters.analysisResults && filters.analysisResults.length > 0) count++;
    return count;
  }, [filters]);

  // Check if filters are applied
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const summary = [];
    
    if (filters.search && filters.search.trim()) {
      summary.push(`Search: "${filters.search}"`);
    }
    
    if (filters.dealTypes && filters.dealTypes.length > 0) {
      summary.push(`Types: ${filters.dealTypes.join(', ')}`);
    }
    
    if (filters.statuses && filters.statuses.length > 0) {
      summary.push(`Status: ${filters.statuses.join(', ')}`);
    }
    
    if (filters.schools && filters.schools.length > 0) {
      const schoolText = filters.schools.length > 2 
        ? `${filters.schools.slice(0, 2).join(', ')} +${filters.schools.length - 2} more`
        : filters.schools.join(', ');
      summary.push(`Schools: ${schoolText}`);
    }
    
    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
      const start = new Date(filters.dateRange.startDate).toLocaleDateString();
      const end = new Date(filters.dateRange.endDate).toLocaleDateString();
      summary.push(`Date: ${start} - ${end}`);
    }
    
    if (filters.fmvRange && (filters.fmvRange[0] > 0 || filters.fmvRange[1] < 100000)) {
      const formatValue = (value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`;
      summary.push(`FMV: ${formatValue(filters.fmvRange[0])} - ${formatValue(filters.fmvRange[1])}`);
    }
    
    if (filters.analysisResults && filters.analysisResults.length > 0) {
      summary.push(`Analysis: ${filters.analysisResults.join(', ')}`);
    }
    
    return summary;
  }, [filters]);

  // Quick filter presets
  const applyQuickFilter = useCallback((preset) => {
    const presetFilters = {
      'recent': {
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }
      },
      'high-value': {
        fmvRange: [25000, 100000]
      },
      'active': {
        statuses: ['active']
      },
      'valuation': {
        dealTypes: ['valuation']
      },
      'clearinghouse': {
        dealTypes: ['clearinghouse']
      },
      'simple': {
        dealTypes: ['simple']
      },
      'draft': {
        statuses: ['draft']
      },
      'completed': {
        statuses: ['completed']
      }
    };

    if (presetFilters[preset]) {
      updateFilters(presetFilters[preset]);
    }
  }, [updateFilters]);

  // Export current filters
  const exportFilters = useCallback(() => {
    return {
      ...filters,
      timestamp: new Date().toISOString(),
      resultCount: filteredDeals.length
    };
  }, [filters, filteredDeals.length]);

  // Import filters
  const importFilters = useCallback((importedFilters) => {
    try {
      // Validate imported filters structure
      const validatedFilters = { ...defaultFilters };
      
      Object.keys(defaultFilters).forEach(key => {
        if (importedFilters[key] !== undefined) {
          validatedFilters[key] = importedFilters[key];
        }
      });
      
      setFilters(validatedFilters);
      return true;
    } catch (error) {
      console.error('Error importing filters:', error);
      return false;
    }
  }, []);

  return {
    // State
    filters,
    filteredDeals,
    isLoading,
    activeFilterCount,
    hasActiveFilters,
    filterSummary,
    
    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    applyQuickFilter,
    exportFilters,
    importFilters,
    
    // Utilities
    setFilters
  };
}; 