/**
 * Error Boundary Component for FairPlay NIL
 * Provides graceful error handling with secure logging and fallback UI
 */

import React from 'react';
import { createLogger } from '../utils/logger';
import FallbackUI from './FallbackUI';

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

    // Update state with error info
    this.setState({
      errorInfo,
      error
    });

    // Report to error tracking service in production
    if (import.meta.env.MODE === 'production') {
      this.reportError(errorDetails);
    }
  }

  reportError = async (errorDetails) => {
    try {
      // Send error report to backend only if the endpoint exists
      const response = await fetch('/api/errors', {
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
      // Only log if it's not a network error (which would be expected if endpoint doesn't exist)
      if (!reportingError.message.includes('fetch')) {
        logger.error('Error reporting failed', { error: reportingError.message });
      }
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
        showDetails: import.meta.env.MODE === 'development'
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

    // Report to error tracking service in production
    if (import.meta.env.MODE === 'production') {
      fetch('/api/errors', {
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
        // Only log if it's not a network error (which would be expected if endpoint doesn't exist)
        if (!reportingError.message.includes('fetch')) {
          logger.error('Error reporting failed', { error: reportingError.message });
        }
      });
    }
  }, []);

  return handleError;
};

export default ErrorBoundary; 