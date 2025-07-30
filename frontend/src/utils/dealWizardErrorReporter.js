/**
 * DealWizard Error Reporter
 * Centralized error reporting for DealWizard components
 * Provides enhanced context, analytics, and error tracking
 */

import { formLogger } from './logger';

class DealWizardErrorReporter {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 50;
    this.reportingEndpoint = null;
    this.isReportingEnabled = import.meta.env.MODE === 'production';
    
    // Initialize reporting endpoint
    if (import.meta.env.VITE_API_URL) {
      this.reportingEndpoint = `${import.meta.env.VITE_API_URL}/api/errors/dealwizard`;
    }
  }

  /**
   * Report error with enhanced DealWizard context
   */
  reportError(error, errorInfo = {}) {
    const errorReport = this.createErrorReport(error, errorInfo);
    
    // Add to queue for batch processing
    this.addToQueue(errorReport);
    
    // Log locally
    this.logError(errorReport);
    
    // Report to backend if enabled
    if (this.isReportingEnabled && this.reportingEndpoint) {
      this.sendToBackend(errorReport);
    }
  }

  /**
   * Create comprehensive error report
   */
  createErrorReport(error, errorInfo) {
    const timestamp = new Date().toISOString();
    const errorId = errorInfo.errorId || `dealwizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      // Core error information
      errorId,
      timestamp,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      },
      
      // DealWizard specific context
      dealWizardContext: {
        stepNumber: errorInfo.stepNumber,
        stepName: errorInfo.stepName,
        dealId: errorInfo.dealId,
        recoveryAttempts: errorInfo.recoveryAttempts || 0,
        recoveryStrategy: errorInfo.recoveryStrategy,
        errorContext: errorInfo.errorContext
      },
      
      // User and session context
      userContext: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      },
      
      // Application context
      appContext: {
        mode: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        buildTime: import.meta.env.VITE_BUILD_TIME || timestamp,
        apiUrl: import.meta.env.VITE_API_URL
      },
      
      // Performance context
      performanceContext: {
        memoryUsage: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null,
        navigationTiming: performance.getEntriesByType('navigation')[0] || null
      },
      
      // Error categorization
      categorization: this.categorizeError(error, errorInfo),
      
      // Additional context from errorInfo
      additionalContext: {
        ...errorInfo,
        errorId,
        timestamp
      }
    };
  }

  /**
   * Categorize error for analytics
   */
  categorizeError(error, errorInfo) {
    const categories = {
      type: 'unknown',
      severity: 'medium',
      recoverable: true,
      userAction: 'none'
    };

    // Determine error type
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      categories.type = 'network';
      categories.severity = 'high';
      categories.userAction = 'retry';
    } else if (error.name === 'ValidationError' || error.message.includes('validation')) {
      categories.type = 'validation';
      categories.severity = 'low';
      categories.userAction = 'fix_input';
    } else if (error.name === 'TypeError' || error.message.includes('undefined')) {
      categories.type = 'runtime';
      categories.severity = 'medium';
      categories.userAction = 'refresh';
    } else if (error.name === 'ReferenceError') {
      categories.type = 'runtime';
      categories.severity = 'high';
      categories.userAction = 'refresh';
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      categories.type = 'authorization';
      categories.severity = 'high';
      categories.userAction = 'login';
    }

    // Determine if error is recoverable
    categories.recoverable = categories.type !== 'authorization' && categories.severity !== 'high';

    return categories;
  }

  /**
   * Add error report to queue
   */
  addToQueue(errorReport) {
    this.errorQueue.push(errorReport);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Log error locally
   */
  logError(errorReport) {
    const logMessage = `DealWizard Error Report: ${errorReport.errorId}`;
    const logData = {
      step: `${errorReport.dealWizardContext.stepNumber} (${errorReport.dealWizardContext.stepName})`,
      dealId: errorReport.dealWizardContext.dealId,
      error: errorReport.error.message,
      type: errorReport.categorization.type,
      severity: errorReport.categorization.severity
    };

    formLogger.error(logMessage, logData);
  }

  /**
   * Send error report to backend
   */
  async sendToBackend(errorReport) {
    try {
      const response = await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      });

      if (!response.ok) {
        console.warn('Failed to send error report to backend:', response.status);
      }
    } catch (error) {
      console.warn('Error sending report to backend:', error);
    }
  }

  /**
   * Get error analytics
   */
  getErrorAnalytics() {
    const analytics = {
      totalErrors: this.errorQueue.length,
      errorTypes: {},
      severityDistribution: {},
      stepDistribution: {},
      timeDistribution: {},
      recoverySuccessRate: 0
    };

    this.errorQueue.forEach(report => {
      // Count error types
      const type = report.categorization.type;
      analytics.errorTypes[type] = (analytics.errorTypes[type] || 0) + 1;

      // Count severity levels
      const severity = report.categorization.severity;
      analytics.severityDistribution[severity] = (analytics.severityDistribution[severity] || 0) + 1;

      // Count errors by step
      const step = report.dealWizardContext.stepName;
      analytics.stepDistribution[step] = (analytics.stepDistribution[step] || 0) + 1;

      // Count errors by hour
      const hour = new Date(report.timestamp).getHours();
      analytics.timeDistribution[hour] = (analytics.timeDistribution[hour] || 0) + 1;
    });

    return analytics;
  }

  /**
   * Clear error queue
   */
  clearQueue() {
    this.errorQueue = [];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10) {
    return this.errorQueue.slice(-limit).reverse();
  }

  /**
   * Check if error is recoverable
   */
  isErrorRecoverable(error) {
    const categorization = this.categorizeError(error, {});
    return categorization.recoverable;
  }

  /**
   * Get recovery suggestions based on error
   */
  getRecoverySuggestions(error, errorInfo = {}) {
    const categorization = this.categorizeError(error, errorInfo);
    const suggestions = [];

    switch (categorization.type) {
      case 'network':
        suggestions.push(
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        );
        break;
      case 'validation':
        suggestions.push(
          'Check your form inputs',
          'Ensure all required fields are filled',
          'Verify your data format'
        );
        break;
      case 'runtime':
        suggestions.push(
          'Refresh the page to reload the application',
          'Clear your browser cache',
          'Try using a different browser'
        );
        break;
      case 'authorization':
        suggestions.push(
          'Please log in again',
          'Check your account permissions',
          'Contact support for assistance'
        );
        break;
      default:
        suggestions.push(
          'Try refreshing the page',
          'Contact support if the problem persists'
        );
    }

    return suggestions;
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled) {
    this.isReportingEnabled = enabled;
  }

  /**
   * Set reporting endpoint
   */
  setReportingEndpoint(endpoint) {
    this.reportingEndpoint = endpoint;
  }
}

// Create singleton instance
export const dealWizardErrorReporter = new DealWizardErrorReporter();

// Export the class for testing
export { DealWizardErrorReporter }; 