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
  Icon,
} from '@chakra-ui/react';
import { FiPhone } from 'react-icons/fi';
import { formatPhoneNumber } from '../../utils/phoneUtils';
import { SPECIFIC_MESSAGES } from '../../utils/validation/validationMessages';

/**
 * Standardized phone number field with consistent formatting and validation
 */
export const PhoneField = ({
  name = 'phone',
  control,
  label = 'Phone Number',
  placeholder = '(555) 555-5555',
  helperText = SPECIFIC_MESSAGES.phone.format,
  isRequired = false,
  showIcon = true,
  ...inputProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error} isRequired={isRequired}>
          <FormLabel>{label}</FormLabel>
          <InputGroup>
            {showIcon && (
              <InputLeftElement pointerEvents="none">
                <Icon as={FiPhone} color="gray.300" />
              </InputLeftElement>
            )}
            <Input
              {...field}
              value={value || ''}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                if (formatted !== undefined) {
                  onChange(formatted);
                }
              }}
              type="tel"
              placeholder={placeholder}
              maxLength={14}
              borderColor={error ? "red.500" : "brand.accentSecondary"}
              _focus={{
                borderColor: error ? "red.500" : "brand.accentPrimary",
                boxShadow: `0 0 0 1px ${error ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-brand-accentPrimary)"}`,
              }}
              {...inputProps}
            />
          </InputGroup>
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

export default PhoneField;