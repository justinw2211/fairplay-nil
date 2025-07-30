import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Select,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  InputGroup,
  InputLeftElement,
  Collapse,
  useDisclosure,
  Badge,
  Wrap,
  WrapItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  FormControl,
  FormLabel,
  useColorModeValue
} from '@chakra-ui/react';
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  AddIcon,
  SettingsIcon,
  CalendarIcon
} from '@chakra-ui/icons';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const FilterPanel = ({
  onFiltersChange,
  deals = [],
  initialFilters = {},
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [filters, setFilters] = useState({
    search: '',
    dealTypes: [],
    statuses: [],
    schools: [],
    dateRange: {
      startDate: null,
      endDate: null
    },
    fmvRange: [0, 100000],
    analysisResults: [],
    ...initialFilters
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const [savedPresets, setSavedPresets] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateSelection, setDateSelection] = useState([{
    startDate: filters.dateRange.startDate ? new Date(filters.dateRange.startDate) : new Date(),
    endDate: filters.dateRange.endDate ? new Date(filters.dateRange.endDate) : new Date(),
    key: 'selection'
  }]);

  const { isOpen: isAdvancedOpen, onToggle: onAdvancedToggle } = useDisclosure({ defaultIsOpen: !isCollapsed });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('filterPresets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading filter presets:', error);
      }
    }
  }, []);

  // Extract unique values from deals for filter options
  const uniqueValues = React.useMemo(() => {
    const dealTypes = [...new Set(deals.map(deal => deal.deal_type).filter(Boolean))];
    const statuses = [...new Set(deals.map(deal => deal.status).filter(Boolean))];
    const schools = [...new Set(deals.map(deal => deal.school).filter(Boolean))];
    const analysisResults = [...new Set(deals.flatMap(deal => [
      deal.clearinghouse_prediction,
      deal.valuation_prediction
    ]).filter(Boolean))];

    return { dealTypes, statuses, schools, analysisResults };
  }, [deals]);

  // Quick filter presets
  const quickFilters = [
    {
      name: 'Active Deals',
      filters: { statuses: ['active'], dealTypes: [], schools: [], analysisResults: [] }
    },
    {
      name: 'High Value',
      filters: { fmvRange: [25000, 100000], dealTypes: [], statuses: [], schools: [], analysisResults: [] }
    },
    {
      name: 'Recent Deals',
      filters: {
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        dealTypes: [], statuses: [], schools: [], analysisResults: []
      }
    },
    {
      name: 'Valuation Deals',
      filters: { dealTypes: ['valuation'], statuses: [], schools: [], analysisResults: [] }
    },
    {
      name: 'Pending Analysis',
      filters: { analysisResults: ['pending'], dealTypes: [], statuses: [], schools: [] }
    }
  ];

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMultiSelectChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(value) ? value : [value]
    }));
  }, []);

  const handleDateRangeChange = useCallback((ranges) => {
    const { selection } = ranges;
    setDateSelection([selection]);
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: selection.startDate.toISOString(),
        endDate: selection.endDate.toISOString()
      }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      dealTypes: [],
      statuses: [],
      schools: [],
      dateRange: { startDate: null, endDate: null },
      fmvRange: [0, 100000],
      analysisResults: []
    };
    setFilters(clearedFilters);
    setSearchInput('');
    setDateSelection([{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }]);
  }, []);

  const applyQuickFilter = useCallback((quickFilter) => {
    setFilters(prev => ({ ...prev, ...quickFilter.filters }));
    if (quickFilter.filters.search !== undefined) {
      setSearchInput(quickFilter.filters.search);
    }
  }, []);

  const saveCurrentFilters = useCallback(() => {
    const name = prompt('Enter a name for this filter preset:');
    if (name && name.trim()) {
      const newPreset = {
        id: Date.now().toString(),
        name: name.trim(),
        filters: { ...filters }
      };
      const updatedPresets = [...savedPresets, newPreset];
      setSavedPresets(updatedPresets);
      localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
    }
  }, [filters, savedPresets]);

  const deletePreset = useCallback((presetId) => {
    const updatedPresets = savedPresets.filter(preset => preset.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
  }, [savedPresets]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.search) {count++;}
    if (filters.dealTypes.length > 0) {count++;}
    if (filters.statuses.length > 0) {count++;}
    if (filters.schools.length > 0) {count++;}
    if (filters.dateRange.startDate && filters.dateRange.endDate) {count++;}
    if (filters.fmvRange[0] > 0 || filters.fmvRange[1] < 100000) {count++;}
    if (filters.analysisResults.length > 0) {count++;}
    return count;
  }, [filters]);

  const formatFMVValue = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <HStack>
            <Heading size="md" color="brand.textPrimary">
              Filters
            </Heading>
            {getActiveFilterCount() > 0 && (
              <Badge colorScheme="blue" borderRadius="full">
                {getActiveFilterCount()}
              </Badge>
            )}
          </HStack>
          <HStack>
            {getActiveFilterCount() > 0 && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <IconButton
              size="sm"
              variant="ghost"
              icon={isAdvancedOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={onAdvancedToggle}
            />
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Search Input */}
          <FormControl>
            <InputGroup>
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search deals, brands, schools..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                bg={useColorModeValue('white', 'gray.700')}
              />
            </InputGroup>
          </FormControl>

          {/* Quick Filters */}
          <Box>
            <Text fontSize="sm" color="brand.textSecondary" mb={2}>
              Quick Filters:
            </Text>
            <Wrap spacing={2}>
              {quickFilters.map((quickFilter, index) => (
                <WrapItem key={index}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyQuickFilter(quickFilter)}
                  >
                    {quickFilter.name}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          </Box>

          <Collapse in={isAdvancedOpen} animateOpacity>
            <VStack spacing={4} align="stretch">
              <Divider />

              {/* Deal Types Filter */}
              <FormControl>
                <FormLabel fontSize="sm" color="brand.textSecondary">
                  Deal Types:
                </FormLabel>
                <CheckboxGroup
                  value={filters.dealTypes}
                  onChange={(value) => handleMultiSelectChange('dealTypes', value)}
                >
                  <Stack direction="row" wrap="wrap">
                    {uniqueValues.dealTypes.map(type => (
                      <Checkbox key={type} value={type} size="sm">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              {/* Status Filter */}
              <FormControl>
                <FormLabel fontSize="sm" color="brand.textSecondary">
                  Status:
                </FormLabel>
                <CheckboxGroup
                  value={filters.statuses}
                  onChange={(value) => handleMultiSelectChange('statuses', value)}
                >
                  <Stack direction="row" wrap="wrap">
                    {uniqueValues.statuses.map(status => (
                      <Checkbox key={status} value={status} size="sm">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              {/* Schools Filter */}
              {uniqueValues.schools.length > 0 && (
                <FormControl>
                  <FormLabel fontSize="sm" color="brand.textSecondary">
                    Schools:
                  </FormLabel>
                  <CheckboxGroup
                    value={filters.schools}
                    onChange={(value) => handleMultiSelectChange('schools', value)}
                  >
                    <Stack direction="row" wrap="wrap" maxH="120px" overflowY="auto">
                      {uniqueValues.schools.map(school => (
                        <Checkbox key={school} value={school} size="sm">
                          {school}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              )}

              {/* FMV Range Filter */}
              <FormControl>
                <FormLabel fontSize="sm" color="brand.textSecondary">
                  FMV Range: {formatFMVValue(filters.fmvRange[0])} - {formatFMVValue(filters.fmvRange[1])}
                </FormLabel>
                <RangeSlider
                  value={filters.fmvRange}
                  onChange={(value) => handleFilterChange('fmvRange', value)}
                  min={0}
                  max={100000}
                  step={1000}
                  colorScheme="brand"
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </FormControl>

              {/* Date Range Filter */}
              <FormControl>
                <FormLabel fontSize="sm" color="brand.textSecondary">
                  Date Range:
                </FormLabel>
                <Button
                  variant="outline"
                  leftIcon={<CalendarIcon />}
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  size="sm"
                >
                  {filters.dateRange.startDate && filters.dateRange.endDate
                    ? `${new Date(filters.dateRange.startDate).toLocaleDateString()} - ${new Date(filters.dateRange.endDate).toLocaleDateString()}`
                    : 'Select Date Range'
                  }
                </Button>
                <Collapse in={isDatePickerOpen} animateOpacity>
                  <Box mt={2} border="1px solid" borderColor={borderColor} borderRadius="md">
                    <DateRange
                      ranges={dateSelection}
                      onChange={handleDateRangeChange}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={1}
                      direction="horizontal"
                    />
                  </Box>
                </Collapse>
              </FormControl>

              {/* Analysis Results Filter */}
              {uniqueValues.analysisResults.length > 0 && (
                <FormControl>
                  <FormLabel fontSize="sm" color="brand.textSecondary">
                    Analysis Results:
                  </FormLabel>
                  <CheckboxGroup
                    value={filters.analysisResults}
                    onChange={(value) => handleMultiSelectChange('analysisResults', value)}
                  >
                    <Stack direction="row" wrap="wrap">
                      {uniqueValues.analysisResults.map(result => (
                        <Checkbox key={result} value={result} size="sm">
                          {result}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              )}

              <Divider />

              {/* Saved Presets */}
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="brand.textSecondary">
                    Saved Presets:
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<AddIcon />}
                    onClick={saveCurrentFilters}
                    isDisabled={getActiveFilterCount() === 0}
                  >
                    Save Current
                  </Button>
                </HStack>

                {savedPresets.length > 0 && (
                  <Wrap spacing={2}>
                    {savedPresets.map(preset => (
                      <WrapItem key={preset.id}>
                        <ButtonGroup size="sm" isAttached>
                          <Button
                            variant="outline"
                            onClick={() => setFilters({ ...preset.filters })}
                          >
                            {preset.name}
                          </Button>
                          <IconButton
                            variant="outline"
                            icon={<CloseIcon />}
                            onClick={() => deletePreset(preset.id)}
                            size="sm"
                          />
                        </ButtonGroup>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default FilterPanel;