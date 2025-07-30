/**
 * Centralized validation error messages for consistent UX
 */

// Generic field validation messages
export const FIELD_MESSAGES = {
  required: (fieldName) => `${fieldName} is required`,
  email: 'Please enter a valid email address',
  minLength: (fieldName, min) => `${fieldName} must be at least ${min} characters`,
  maxLength: (fieldName, max) => `${fieldName} must be less than ${max} characters`,
  min: (fieldName, min) => `${fieldName} must be at least ${min}`,
  max: (fieldName, max) => `${fieldName} must be no more than ${max}`,
  positiveNumber: (fieldName) => `${fieldName} must be a positive number`,
  invalidFormat: (fieldName) => `Please enter a valid ${fieldName.toLowerCase()}`,
  mustMatch: (field1, field2) => `${field1} must match ${field2}`,
  selectRequired: (fieldName) => `Please select a ${fieldName.toLowerCase()}`,
  minSelection: (fieldName, min) => `Please select at least ${min} ${fieldName.toLowerCase()}`,
};

// Specific field validation messages
export const SPECIFIC_MESSAGES = {
  // Authentication
  password: {
    minLength: 'Password must be at least 8 characters',
    required: 'Password is required',
    mismatch: 'Passwords must match',
  },

  // Profile fields
  fullName: {
    required: 'Full name is required',
    minLength: 'Name must be at least 2 characters',
    maxLength: 'Name must be less than 100 characters',
  },

  phone: {
    required: 'Phone number is required',
    invalid: 'Phone number must be 10 digits',
    format: 'Please use format: (XXX) XXX-XXXX',
  },

  // Deal fields
  payorName: {
    required: 'Payor name is required',
    maxLength: 'Payor name must be less than 100 characters',
  },

  dealDescription: {
    required: 'Deal description is required',
    maxLength: 'Description must be 200 characters or less',
  },

  compensation: {
    required: 'Compensation amount is required',
    positive: 'Amount must be greater than 0',
    format: 'Please enter a valid amount',
  },

  // Activity fields
  quantity: {
    required: 'Quantity is required',
    positive: 'Quantity must be greater than 0',
    integer: 'Quantity must be a whole number',
  },

  percentage: {
    required: 'Percentage is required',
    range: 'Percentage must be between 0 and 100',
  },

  // Selection fields
  division: {
    required: 'NCAA Division is required',
    invalid: 'Please select a valid NCAA Division',
  },

  university: {
    required: 'University is required',
    invalid: 'Please select a valid university',
  },

  gender: {
    required: 'Gender is required',
    invalid: 'Please select a valid gender',
  },

  sports: {
    required: 'At least one sport is required',
    minSelection: 'Please select at least one sport',
  },

  role: {
    required: 'Please select what best describes you',
  },
};

// Toast message templates
export const TOAST_MESSAGES = {
  // Success messages
  success: {
    profileUpdated: 'Profile updated successfully',
    dealCreated: 'Deal created successfully',
    dealUpdated: 'Deal updated successfully',
    dealSubmitted: 'Deal submitted for review',
    accountCreated: 'Account created successfully! Welcome to FairPlay NIL!',
  },

  // Error messages
  error: {
    profileUpdate: 'Error updating profile. Please try again.',
    dealCreate: 'Error creating deal. Please try again.',
    dealUpdate: 'Error updating deal. Please try again.',
    dealSubmit: 'Error submitting deal. Please try again.',
    signUp: 'Sign up failed. Please try again.',
    signIn: 'Sign in failed. Please check your credentials.',
    network: 'Network error. Please check your connection and try again.',
    server: 'Server error. Please try again later.',
    authentication: 'Authentication error. Please log in again.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Please correct the highlighted errors and try again.',
  },

  // Warning messages
  warning: {
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    dataLoss: 'This action cannot be undone.',
    schoolsLoading: 'Could not load schools list. Using fallback data.',
    emailVerification: 'Please check your email for a verification link.',
  },

  // Info messages
  info: {
    universityReset: 'Selected university is not available in the new division.',
    sessionExpired: 'Your session has expired. Please log in again.',
    changesSaved: 'Changes saved automatically',
  },
};

// Form submission states
export const FORM_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{3}\) \d{3}-\d{4}$/,
  phoneDigitsOnly: /^\d{10}$/,
  positiveNumber: /^\d*\.?\d+$/,
  integer: /^\d+$/,
  percentage: /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/,
};