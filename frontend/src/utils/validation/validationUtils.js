import { VALIDATION_PATTERNS, SPECIFIC_MESSAGES } from './validationMessages';

/**
 * Utility functions for common validation logic
 */

// Phone number validation (accepts formatted phone)
export const validatePhoneNumber = (phone) => {
  if (!phone) {return false;}

  // Remove formatting and check if it's 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

// Email validation
export const validateEmail = (email) => {
  if (!email) {return false;}
  return VALIDATION_PATTERNS.email.test(email);
};

// Password strength validation
export const validatePassword = (password) => {
  if (!password) {return { isValid: false, message: SPECIFIC_MESSAGES.password.required };}
  if (password.length < 8) {return { isValid: false, message: SPECIFIC_MESSAGES.password.minLength };}

  return { isValid: true, message: null };
};

// Positive number validation
export const validatePositiveNumber = (value, fieldName = 'Value') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, message: `${fieldName} must be greater than 0` };
  }

  return { isValid: true, message: null };
};

// Percentage validation (0-100)
export const validatePercentage = (value) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: SPECIFIC_MESSAGES.percentage.required };
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    return { isValid: false, message: SPECIFIC_MESSAGES.percentage.range };
  }

  return { isValid: true, message: null };
};

// Integer validation
export const validateInteger = (value, fieldName = 'Value') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const numValue = parseInt(value);
  if (isNaN(numValue) || numValue !== parseFloat(value) || numValue <= 0) {
    return { isValid: false, message: `${fieldName} must be a positive whole number` };
  }

  return { isValid: true, message: null };
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, message: null };
};

// Array minimum selection validation
export const validateMinSelection = (array, min, fieldName = 'Selection') => {
  if (!Array.isArray(array) || array.length < min) {
    return {
      isValid: false,
      message: `Please select at least ${min} ${fieldName.toLowerCase()}${min > 1 ? 's' : ''}`
    };
  }

  return { isValid: true, message: null };
};

// Text length validation
export const validateLength = (text, min, max, fieldName = 'Field') => {
  if (!text) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (text.length < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min} characters` };
  }

  if (max && text.length > max) {
    return { isValid: false, message: `${fieldName} must be less than ${max} characters` };
  }

  return { isValid: true, message: null };
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
    allowedExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg']
  } = options;

  if (!file) {
    return { isValid: false, message: 'Please select a file' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: `Please upload a ${allowedExtensions.join(', ').toUpperCase()} file` };
  }

  // Check file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, message: `Please upload a ${allowedExtensions.join(', ').toUpperCase()} file` };
  }

  return { isValid: true, message: null };
};

// URL validation
export const validateUrl = (url) => {
  if (!url) {return { isValid: false, message: 'URL is required' };}

  try {
    new URL(url);
    return { isValid: true, message: null };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

// Date validation
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, fieldName = 'Date' } = options;

  if (!date) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Please enter a valid ${fieldName.toLowerCase()}` };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, message: `${fieldName} must be after ${new Date(minDate).toLocaleDateString()}` };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, message: `${fieldName} must be before ${new Date(maxDate).toLocaleDateString()}` };
  }

  return { isValid: true, message: null };
};

// Form validation helper - validates multiple fields at once
export const validateFormFields = (fields) => {
  const errors = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, { value, validators }]) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

// Async validation helper
export const validateAsync = async (value, asyncValidator) => {
  try {
    const result = await asyncValidator(value);
    return result;
  } catch (error) {
    return { isValid: false, message: 'Validation failed. Please try again.' };
  }
};