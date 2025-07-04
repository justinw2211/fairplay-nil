import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import Select from 'react-select';
import { fetchSchools, FALLBACK_SCHOOLS } from '../../data/ncaaSchools';
import { SPECIFIC_MESSAGES } from '../../utils/validation/validationMessages';

/**
 * Standardized school selection field with division filtering
 */
export const SchoolField = ({
  name = 'university',
  control,
  label = 'University',
  placeholder = 'Select your university',
  helperText,
  isRequired = false,
  divisionFieldName = 'division',
  watchDivision, // Function to watch the division field
  onSchoolsLoad, // Callback when schools are loaded
  ...selectProps
}) => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Standardized select styles
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused 
        ? 'var(--chakra-colors-brand-accentPrimary)' 
        : 'var(--chakra-colors-brand-accentSecondary)',
      boxShadow: state.isFocused ? '0 0 0 1px var(--chakra-colors-brand-accentPrimary)' : 'none',
      '&:hover': {
        borderColor: 'var(--chakra-colors-brand-accentPrimary)',
      },
      minHeight: '40px',
      backgroundColor: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--chakra-colors-brand-accentPrimary)' 
        : state.isFocused 
        ? 'var(--chakra-colors-brand-backgroundLight)' 
        : 'white',
      color: state.isSelected ? 'white' : 'var(--chakra-colors-brand-textPrimary)',
    }),
  };

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      setIsLoadingSchools(true);
      setLoadError(null);
      
      try {
        const schoolsData = await fetchSchools();
        const finalSchools = schoolsData.length > 0 ? schoolsData : FALLBACK_SCHOOLS;
        setSchools(finalSchools);
        
        if (onSchoolsLoad) {
          onSchoolsLoad(finalSchools);
        }
      } catch (error) {
        console.error('Error loading schools:', error);
        setLoadError(error.message);
        setSchools(FALLBACK_SCHOOLS);
        
        if (onSchoolsLoad) {
          onSchoolsLoad(FALLBACK_SCHOOLS, error);
        }
      } finally {
        setIsLoadingSchools(false);
      }
    };

    loadSchools();
  }, [onSchoolsLoad]);

  // Filter schools when division changes
  useEffect(() => {
    if (watchDivision && schools.length > 0) {
      const selectedDivision = watchDivision();
      
      if (selectedDivision) {
        const filtered = schools.filter(
          school => school.division === selectedDivision
        );
        setFilteredSchools(filtered);
      } else {
        setFilteredSchools([]);
      }
    } else if (!watchDivision) {
      // If no division filtering, show all schools
      setFilteredSchools(schools);
    }
  }, [watchDivision, schools]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error} isRequired={isRequired}>
          <FormLabel>{label}</FormLabel>
          {isLoadingSchools ? (
            <Flex justify="center" align="center" h="40px">
              <Spinner size="sm" color="brand.accentPrimary" />
            </Flex>
          ) : (
            <Select
              {...field}
              options={filteredSchools.map(school => ({
                value: school.name,
                label: school.name,
                division: school.division
              }))}
              value={value ? { value, label: value } : null}
              onChange={(option) => onChange(option?.value || '')}
              styles={selectStyles}
              placeholder={placeholder}
              isDisabled={watchDivision && !watchDivision()} // Disable if division required but not selected
              isClearable
              isSearchable
              noOptionsMessage={() => 
                watchDivision && !watchDivision() 
                  ? 'Please select a division first'
                  : 'No universities found'
              }
              {...selectProps}
            />
          )}
          {error && (
            <FormErrorMessage>{error.message}</FormErrorMessage>
          )}
          {helperText && !error && (
            <FormHelperText>{helperText}</FormHelperText>
          )}
          {loadError && !error && (
            <FormHelperText color="orange.500">
              Warning: Using fallback school data. {loadError}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default SchoolField; 