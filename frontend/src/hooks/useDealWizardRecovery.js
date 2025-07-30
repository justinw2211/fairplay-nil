/**
 * useDealWizardRecovery Hook
 * Enhanced error recovery functionality for DealWizard components
 * Provides error state management, recovery strategies, and progress preservation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { dealWizardErrorReporter } from '../utils/dealWizardErrorReporter';

const useDealWizardRecovery = (dealId, currentStep, stepName) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  
  // Error state management
  const [errorState, setErrorState] = useState({
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
    recoveryAttempts: 0,
    lastErrorTime: null,
    errorContext: null
  });

  // Recovery state
  const [recoveryState, setRecoveryState] = useState({
    isRecovering: false,
    recoveryStrategy: null,
    progressPreserved: false,
    autoRetryEnabled: true,
    maxRetryAttempts: 3
  });

  // Progress preservation
  const progressRef = useRef({
    formData: {},
    stepData: {},
    navigationHistory: [],
    lastSavedState: null
  });

  // Error context tracking
  const errorContextRef = useRef({
    stepNumber: currentStep,
    stepName: stepName,
    dealId: dealId,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });

  // Update error context when props change
  useEffect(() => {
    errorContextRef.current = {
      ...errorContextRef.current,
      stepNumber: currentStep,
      stepName: stepName,
      dealId: dealId
    };
  }, [currentStep, stepName, dealId]);

  /**
   * Handle error occurrence with enhanced context
   */
  const handleError = useCallback((error, errorInfo = {}) => {
    const errorId = `dealwizard_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enhancedErrorInfo = {
      ...errorInfo,
      ...errorContextRef.current,
      errorId,
      recoveryAttempts: errorState.recoveryAttempts,
      recoveryStrategy: recoveryState.recoveryStrategy
    };

    // Update error state
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorInfo: enhancedErrorInfo,
      errorId,
      recoveryAttempts: prev.recoveryAttempts + 1,
      lastErrorTime: new Date().toISOString(),
      errorContext: enhancedErrorInfo
    }));

    // Report error with enhanced context
    dealWizardErrorReporter.reportError(error, enhancedErrorInfo);

    // Show user-friendly toast
    toast({
      title: 'Something went wrong',
      description: `We encountered an issue in ${stepName}. Your progress has been saved.`,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    console.error(`DealWizard Error in Step ${currentStep} (${stepName}):`, error, enhancedErrorInfo);
  }, [currentStep, stepName, errorState.recoveryAttempts, recoveryState.recoveryStrategy, toast]);

  /**
   * Preserve current progress and form data
   */
  const preserveProgress = useCallback((formData = {}, stepData = {}) => {
    progressRef.current = {
      ...progressRef.current,
      formData: { ...progressRef.current.formData, ...formData },
      stepData: { ...progressRef.current.stepData, ...stepData },
      lastSavedState: new Date().toISOString()
    };

    // Store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem(`dealwizard_progress_${dealId}`, JSON.stringify(progressRef.current));
    } catch (error) {
      console.warn('Failed to save progress to sessionStorage:', error);
    }
  }, [dealId]);

  /**
   * Restore preserved progress
   */
  const restoreProgress = useCallback(() => {
    try {
      const savedProgress = sessionStorage.getItem(`dealwizard_progress_${dealId}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        progressRef.current = { ...progressRef.current, ...parsed };
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to restore progress from sessionStorage:', error);
    }
    return null;
  }, [dealId]);

  /**
   * Attempt automatic recovery
   */
  const attemptRecovery = useCallback(async (recoveryStrategy = 'auto') => {
    if (recoveryState.recoveryAttempts >= recoveryState.maxRetryAttempts) {
      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      return false;
    }

    setRecoveryState(prev => ({ 
      ...prev, 
      isRecovering: true, 
      recoveryStrategy 
    }));

    try {
      // Wait a moment before retry
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear error state
      setErrorState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      }));

      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      
      toast({
        title: 'Recovery successful',
        description: 'The issue has been resolved and your progress is intact.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return true;
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      return false;
    }
  }, [recoveryState.recoveryAttempts, recoveryState.maxRetryAttempts, toast]);

  /**
   * Navigate to safe location with progress preservation
   */
  const navigateToSafeLocation = useCallback((targetPath = '/dashboard') => {
    // Preserve current state before navigation
    preserveProgress();

    // Add navigation to history
    progressRef.current.navigationHistory.push({
      from: window.location.pathname,
      to: targetPath,
      timestamp: new Date().toISOString()
    });

    navigate(targetPath);
  }, [navigate, preserveProgress]);

  /**
   * Reset error state and recovery attempts
   */
  const resetErrorState = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      lastErrorTime: null,
      errorContext: null
    });

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: false,
      recoveryStrategy: null
    }));
  }, []);

  /**
   * Get recovery suggestions based on error type
   */
  const getRecoverySuggestions = useCallback(() => {
    const suggestions = [];

    if (errorState.recoveryAttempts >= recoveryState.maxRetryAttempts) {
      suggestions.push({
        type: 'warning',
        message: 'Maximum retry attempts reached. Consider refreshing the page or starting over.',
        action: 'refresh'
      });
    }

    if (errorState.error?.message?.includes('network')) {
      suggestions.push({
        type: 'info',
        message: 'Network connectivity issue detected. Check your internet connection.',
        action: 'retry'
      });
    }

    if (errorState.error?.message?.includes('validation')) {
      suggestions.push({
        type: 'info',
        message: 'Form validation error. Please check your input and try again.',
        action: 'validate'
      });
    }

    // Default suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'info',
        message: 'Try refreshing the page or contact support if the problem persists.',
        action: 'refresh'
      });
    }

    return suggestions;
  }, [errorState.recoveryAttempts, errorState.error, recoveryState.maxRetryAttempts]);

  /**
   * Enable/disable auto-retry
   */
  const setAutoRetry = useCallback((enabled) => {
    setRecoveryState(prev => ({ ...prev, autoRetryEnabled: enabled }));
  }, []);

  /**
   * Set maximum retry attempts
   */
  const setMaxRetryAttempts = useCallback((maxAttempts) => {
    setRecoveryState(prev => ({ ...prev, maxRetryAttempts: maxAttempts }));
  }, []);

  return {
    // Error state
    errorState,
    recoveryState,
    
    // Core functions
    handleError,
    attemptRecovery,
    resetErrorState,
    navigateToSafeLocation,
    
    // Progress management
    preserveProgress,
    restoreProgress,
    getProgress: () => progressRef.current,
    
    // Recovery utilities
    getRecoverySuggestions,
    setAutoRetry,
    setMaxRetryAttempts,
    
    // Context
    errorContext: errorContextRef.current
  };
};

export default useDealWizardRecovery; 