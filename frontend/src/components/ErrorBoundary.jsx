/**
 * Error Boundary Component for FairPlay NIL
 * Provides graceful error handling with secure logging and fallback UI
 */

import React from 'react';
import { createLogger } from '../utils/logger';
import FallbackUI from './FallbackUI';
import * as Sentry from '@sentry/react';
import { getConfig, isProduction, isDevelopment } from '../config/environment';

const logger = createLogger('ErrorBoundary');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error securely without sensitive data
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: this.props.context || 'Unknown'
    };

    // Log the error
    logger.error('Component Error Caught', errorDetails);

    // Report to Sentry with enhanced context
    try {
      Sentry.captureException(error, {
        contexts: {
          errorBoundary: {
            errorId: this.state.errorId,
            context: this.props.context || 'Unknown',
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        },
        tags: {
          errorBoundary: 'true',
          context: this.props.context || 'Unknown',
          errorId: this.state.errorId
        },
        extra: {
          errorDetails,
          componentProps: this.props.context ? { context: this.props.context } : {}
        }
      });
    } catch (sentryError) {
      // Fallback if Sentry fails - don't break existing error handling
      logger.warn('Sentry error reporting failed', { error: sentryError.message });
    }

    // Update state with error info
    this.setState({
      errorInfo,
      error
    });

    // Report to error tracking service in production (existing functionality)
    if (isProduction && getConfig().apiUrl) {
      fetch(`${getConfig().apiUrl}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails)
      }).then(response => {
        if (response.status === 404) {
          // API endpoint doesn't exist - this is expected
          logger.debug('Error reporting endpoint not available');
          return;
        }
        if (!response.ok) {
          logger.warn('Failed to report error to backend', { status: response.status });
        }
      }).catch(reportingError => {
        // Silently fail - don't spam console with error reporting failures
        logger.debug('Error reporting failed', { error: reportingError.message });
      });
    }
  }

  reportError = async (errorDetails) => {
    try {
      // Report to Sentry first
      try {
        Sentry.captureException(new Error(errorDetails.message), {
          contexts: {
            manualError: {
              errorId: errorDetails.errorId,
              context: errorDetails.context || 'Manual',
              url: errorDetails.url,
              userAgent: errorDetails.userAgent
            }
          },
          tags: {
            manualError: 'true',
            context: errorDetails.context || 'Manual',
            errorId: errorDetails.errorId
          },
          extra: {
            errorDetails
          }
        });
      } catch (sentryError) {
        logger.warn('Sentry error reporting failed', { error: sentryError.message });
      }

      // Only attempt error reporting if we're in production AND have an API URL configured
      if (!isProduction || !getConfig().apiUrl) {
        logger.debug('Error reporting skipped - not in production or API URL not configured');
        return;
      }

      // Send error report to backend only if the endpoint exists
      const response = await fetch(`${getConfig().apiUrl}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails)
      });

      if (response.status === 404) {
        // API endpoint doesn't exist - this is expected in development
        logger.debug('Error reporting endpoint not available');
        return;
      }

      if (!response.ok) {
        logger.warn('Failed to report error to backend', { status: response.status });
      }
    } catch (reportingError) {
      // Silently fail - don't spam console with error reporting failures
      logger.debug('Error reporting failed', { error: reportingError.message });
    }
  };

  handleRetry = () => {
    this.setState({ isRetrying: true });

    // Give a brief moment for state update, then reset
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        isRetrying: false
      });
    }, 500);
  };

  render() {
    if (this.state.hasError) {
      const fallbackProps = {
        error: this.state.error,
        errorId: this.state.errorId,
        onRetry: this.handleRetry,
        isRetrying: this.state.isRetrying,
        context: this.props.context,
        showDetails: isDevelopment
      };

      // Use custom fallback component if provided
      if (this.props.fallback) {
        return React.createElement(this.props.fallback, fallbackProps);
      }

      // Use fallback render function if provided
      if (this.props.fallbackRender) {
        return this.props.fallbackRender(fallbackProps);
      }

      // Default fallback UI
      return <FallbackUI {...fallbackProps} />;
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting from functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    const errorDetails = {
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInfo
    };

    logger.error('Manual Error Report', errorDetails);

    // Report to Sentry
    try {
      Sentry.captureException(error, {
        contexts: {
          manualError: {
            errorId: errorDetails.errorId,
            context: errorInfo.context || 'Manual',
            url: errorDetails.url,
            userAgent: errorDetails.userAgent
          }
        },
        tags: {
          manualError: 'true',
          context: errorInfo.context || 'Manual',
          errorId: errorDetails.errorId
        },
        extra: {
          errorDetails,
          errorInfo
        }
      });
    } catch (sentryError) {
      logger.warn('Sentry error reporting failed', { error: sentryError.message });
    }

    // Report to error tracking service in production (existing functionality)
    if (isProduction && getConfig().apiUrl) {
      fetch(`${getConfig().apiUrl}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails)
      }).then(response => {
        if (response.status === 404) {
          // API endpoint doesn't exist - this is expected
          logger.debug('Error reporting endpoint not available');
          return;
        }
        if (!response.ok) {
          logger.warn('Failed to report error to backend', { status: response.status });
        }
      }).catch(reportingError => {
        // Silently fail - don't spam console with error reporting failures
        logger.debug('Error reporting failed', { error: reportingError.message });
      });
    }
  }, []);

  return handleError;
};

export default ErrorBoundary;