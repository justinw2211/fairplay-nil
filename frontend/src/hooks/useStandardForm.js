import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { TOAST_MESSAGES, FORM_STATES } from '../utils/validation/validationMessages';

/**
 * Standardized form hook that provides consistent validation, error handling, and submission states
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.schema - Yup validation schema
 * @param {Object} options.defaultValues - Default form values
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Object} options.toastMessages - Custom toast messages
 * @param {string} options.mode - Form validation mode ('onChange', 'onBlur', 'onSubmit')
 * @param {boolean} options.reValidateMode - Whether to re-validate on change after first validation
 * @returns {Object} Form utilities and state
 */
export const useStandardForm = ({
  schema,
  defaultValues = {},
  onSubmit,
  toastMessages = {},
  mode = 'onChange',
  reValidateMode = 'onChange'
}) => {
  const toast = useToast();
  const [submitState, setSubmitState] = useState(FORM_STATES.idle);
  const [submitError, setSubmitError] = useState(null);

  // Merge custom toast messages with defaults
  const messages = {
    success: TOAST_MESSAGES.success.profileUpdated,
    error: TOAST_MESSAGES.error.profileUpdate,
    validation: TOAST_MESSAGES.error.validation,
    ...toastMessages
  };

  // Initialize react-hook-form
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode,
    reValidateMode
  });

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, touchedFields, dirtyFields },
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
    control
  } = form;

  // Standardized submit handler
  const onSubmitHandler = useCallback(async (data) => {
    if (!onSubmit) {return;}

    setSubmitState(FORM_STATES.loading);
    setSubmitError(null);

    try {
      const result = await onSubmit(data);

      setSubmitState(FORM_STATES.success);

      // Show success toast
      toast({
        title: 'Success',
        description: messages.success,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return result;
    } catch (error) {
      setSubmitState(FORM_STATES.error);
      setSubmitError(error.message || 'An error occurred');

      // Handle validation errors from server
      if (error.validationErrors) {
        Object.entries(error.validationErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });

        toast({
          title: 'Validation Error',
          description: messages.validation,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      } else {
        // Show general error toast
        toast({
          title: 'Error',
          description: error.message || messages.error,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      }

      throw error; // Re-throw for component-level handling if needed
    }
  }, [onSubmit, toast, messages, setError]);

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Check if form is valid and ready to submit
  const isValid = !hasErrors && !isSubmitting;

  // Reset form with optional new default values
  const resetForm = useCallback((newDefaultValues) => {
    setSubmitState(FORM_STATES.idle);
    setSubmitError(null);
    reset(newDefaultValues || defaultValues);
  }, [reset, defaultValues]);

  // Validate specific field
  const validateField = useCallback(async (fieldName) => {
    return await trigger(fieldName);
  }, [trigger]);

  // Validate entire form
  const validateForm = useCallback(async () => {
    return await trigger();
  }, [trigger]);

  // Set form values programmatically
  const setFormValue = useCallback((name, value, options = {}) => {
    setValue(name, value, { shouldValidate: true, shouldDirty: true, ...options });
  }, [setValue]);

  // Get field error message
  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName]?.message;
  }, [errors]);

  // Check if specific field has error
  const hasFieldError = useCallback((fieldName) => {
    return !!errors[fieldName];
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldName) => {
    return !!touchedFields[fieldName];
  }, [touchedFields]);

  // Check if field is dirty
  const isFieldDirty = useCallback((fieldName) => {
    return !!dirtyFields[fieldName];
  }, [dirtyFields]);

  // Get all form data
  const getFormData = useCallback(() => {
    return getValues();
  }, [getValues]);

  // Watch specific field
  const watchField = useCallback((fieldName) => {
    return watch(fieldName);
  }, [watch]);

  // Watch multiple fields
  const watchFields = useCallback((fieldNames) => {
    return watch(fieldNames);
  }, [watch]);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName) => {
    clearErrors(fieldName);
  }, [clearErrors]);

  // Set field error manually
  const setFieldError = useCallback((fieldName, message) => {
    setError(fieldName, { type: 'manual', message });
  }, [setError]);

  return {
    // Form methods
    handleSubmit: handleSubmit(onSubmitHandler),
    reset: resetForm,
    control,

    // Form state
    errors,
    isDirty,
    isSubmitting,
    touchedFields,
    dirtyFields,
    submitState,
    submitError,
    hasErrors,
    isValid,

    // Utility methods
    validateField,
    validateForm,
    setFormValue,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    isFieldDirty,
    getFormData,
    watchField,
    watchFields,
    clearFieldError,
    setFieldError,

    // Direct form methods (for advanced usage)
    formMethods: form,
  };
};

/**
 * Hook for handling async operations with loading states
 *
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Async operation state and execute function
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const toast = useToast();

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);

      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return result;
    } catch (err) {
      setError(err.message || errorMessage);

      if (showErrorToast) {
        toast({
          title: 'Error',
          description: err.message || errorMessage,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, toast, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  return {
    loading,
    error,
    data,
    execute,
  };
};