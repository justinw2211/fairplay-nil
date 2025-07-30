/**
 * DealWizardStepWrapper Component
 * Error boundary wrapper for individual DealWizard steps
 * Provides step-specific error handling and context
 */

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import DealWizardErrorFallback from './DealWizardErrorFallback';
import useDealWizardRecovery from '../hooks/useDealWizardRecovery';
import { dealWizardErrorReporter } from '../utils/dealWizardErrorReporter';

const DealWizardStepWrapper = ({
  children,
  stepNumber,
  stepName,
  onError,
  dealId,
  ...props
}) => {
  // Initialize recovery hook
  const recovery = useDealWizardRecovery(dealId, stepNumber, stepName);

  const handleError = (error, errorInfo) => {
    // Enhanced error logging with DealWizard context
    console.error(`Error in DealWizard Step ${stepNumber} (${stepName}):`, error);

    // Report error with enhanced context
    const enhancedErrorInfo = {
      ...errorInfo,
      stepNumber,
      stepName,
      dealId,
      errorContext: recovery.errorContext
    };

    // Use recovery hook to handle error
    recovery.handleError(error, enhancedErrorInfo);

    // Call parent error handler if provided
    if (onError) {
      onError(error, enhancedErrorInfo, stepNumber);
    }
  };

  const handleRetry = async () => {
    // Attempt recovery using the hook
    const success = await recovery.attemptRecovery('manual');

    if (success) {
      // Recovery successful, reset error state
      recovery.resetErrorState();
    } else {
      // Recovery failed, show enhanced error fallback
      console.warn('Recovery attempt failed, showing enhanced error UI');
    }
  };

  const handleNavigateToSafeLocation = (targetPath = '/dashboard') => {
    recovery.navigateToSafeLocation(targetPath);
  };

  return (
    <ErrorBoundary
      context={`DealWizard-Step${stepNumber}`}
      onError={handleError}
      fallbackRender={(fallbackProps) => (
        <DealWizardErrorFallback
          {...fallbackProps}
          currentStep={stepNumber}
          stepName={stepName}
          onRetry={handleRetry}
          onNavigateToSafeLocation={handleNavigateToSafeLocation}
          recoveryState={recovery.recoveryState}
          errorState={recovery.errorState}
          recoverySuggestions={recovery.getRecoverySuggestions()}
          {...props}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default DealWizardStepWrapper; 