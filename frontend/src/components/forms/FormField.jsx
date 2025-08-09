import React from 'react';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea,
  Select as ChakraSelect,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Icon,
} from '@chakra-ui/react';
import Select from 'react-select';

/**
 * Standardized form field component with consistent styling and validation
 */
export const FormField = ({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  helperText,
  isRequired = false,
  rules,
  leftIcon,
  rightIcon,
  maxLength,
  options = [], // For select/radio fields
  isMulti = false, // For multi-select
  customSelectStyles = {},
  ...inputProps
}) => {
  // Default styles for react-select
  const defaultSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? 'var(--chakra-colors-brand-accentPrimary)' : 'var(--chakra-colors-brand-accentSecondary)',
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
    ...customSelectStyles
  };

  const renderInput = (field, error) => {
    const inputElement = (() => {
      switch (type) {
        case 'textarea':
          return (
            <Textarea
              {...field}
              placeholder={placeholder}
              maxLength={maxLength}
              resize="none"
              minHeight="100px"
              borderColor={error ? "red.500" : "brand.accentSecondary"}
              _focus={{
                borderColor: error ? "red.500" : "brand.accentPrimary",
                boxShadow: `0 0 0 1px ${error ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-brand-accentPrimary)"}`,
              }}
              {...inputProps}
            />
          );

        case 'select':
          return (
            <ChakraSelect
              {...field}
              placeholder={placeholder}
              borderColor={error ? "red.500" : "brand.accentSecondary"}
              _focus={{
                borderColor: error ? "red.500" : "brand.accentPrimary",
                boxShadow: `0 0 0 1px ${error ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-brand-accentPrimary)"}`,
              }}
              {...inputProps}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ChakraSelect>
          );

        case 'react-select':
          return (
            <Select
              {...field}
              options={options}
              styles={defaultSelectStyles}
              placeholder={placeholder}
              isMulti={isMulti}
              value={
                isMulti
                  ? options.filter(option => field.value?.includes(option.value))
                  : options.find(option => option.value === field.value) || null
              }
              onChange={(selectedOption) => {
                if (isMulti) {
                  field.onChange(selectedOption ? selectedOption.map(opt => opt.value) : []);
                } else {
                  field.onChange(selectedOption ? selectedOption.value : '');
                }
              }}
              {...inputProps}
            />
          );

        case 'radio':
          return (
            <RadioGroup {...field}>
              <Stack direction="row" spacing={4}>
                {options.map((option) => (
                  <Radio key={option.value} value={option.value} colorScheme="brand">
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          );

        case 'checkbox':
          return (
            <Checkbox
              {...field}
              isChecked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              colorScheme="brand"
              {...inputProps}
            >
              {placeholder}
            </Checkbox>
          );

        default:
          const input = (
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              borderColor={error ? "red.500" : "brand.accentSecondary"}
              _focus={{
                borderColor: error ? "red.500" : "brand.accentPrimary",
                boxShadow: `0 0 0 1px ${error ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-brand-accentPrimary)"}`,
              }}
              {...inputProps}
            />
          );

          if (leftIcon || rightIcon) {
            return (
              <InputGroup>
                {leftIcon && (
                  <InputLeftElement pointerEvents="none">
                    <Icon as={leftIcon} color="gray.300" />
                  </InputLeftElement>
                )}
                {input}
                {rightIcon && (
                  <InputRightElement pointerEvents="none">
                    <Icon as={rightIcon} color="gray.300" />
                  </InputRightElement>
                )}
              </InputGroup>
            );
          }

          return input;
      }
    })();

    return inputElement;
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl isInvalid={!!error} isRequired={isRequired}>
          {label && type !== 'checkbox' && (
            <FormLabel htmlFor={name}>{label}</FormLabel>
          )}
          {renderInput(field, error)}
          {error && (
            <FormErrorMessage>{error.message}</FormErrorMessage>
          )}
          {helperText && !error && (
            <FormHelperText>{helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default FormField;