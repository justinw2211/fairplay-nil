/**
 * DealWizard Error Reporter Tests
 * Comprehensive tests for the centralized error reporting utility
 */

import { DealWizardErrorReporter } from './dealWizardErrorReporter';

// Mock the formLogger
jest.mock('./logger', () => ({
  formLogger: {
    error: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    },
    getEntriesByType: jest.fn().mockReturnValue([{
      name: 'test-navigation',
      duration: 1000
    }])
  }
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    language: 'en-US'
  }
});

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080
  }
});

// Mock window
Object.defineProperty(window, 'innerWidth', { value: 1200 });
Object.defineProperty(window, 'innerHeight', { value: 800 });

describe('DealWizardErrorReporter', () => {
  let reporter;

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new DealWizardErrorReporter();
  });

  describe('Error Categorization', () => {
    it('categorizes network errors correctly', () => {
      const error = new Error('fetch failed');
      error.name = 'NetworkError';
      
      const categorization = reporter.categorizeError(error, {});
      
      expect(categorization.type).toBe('network');
      expect(categorization.severity).toBe('high');
      expect(categorization.userAction).toBe('retry');
      expect(categorization.recoverable).toBe(true);
    });

    it('categorizes validation errors correctly', () => {
      const error = new Error('validation failed');
      error.name = 'ValidationError';
      
      const categorization = reporter.categorizeError(error, {});
      
      expect(categorization.type).toBe('validation');
      expect(categorization.severity).toBe('low');
      expect(categorization.userAction).toBe('fix_input');
      expect(categorization.recoverable).toBe(true);
    });

    it('categorizes runtime errors correctly', () => {
      const error = new Error('undefined is not a function');
      error.name = 'TypeError';
      
      const categorization = reporter.categorizeError(error, {});
      
      expect(categorization.type).toBe('runtime');
      expect(categorization.severity).toBe('medium');
      expect(categorization.userAction).toBe('refresh');
      expect(categorization.recoverable).toBe(true);
    });

    it('categorizes authorization errors correctly', () => {
      const error = new Error('unauthorized access');
      
      const categorization = reporter.categorizeError(error, {});
      
      expect(categorization.type).toBe('authorization');
      expect(categorization.severity).toBe('high');
      expect(categorization.userAction).toBe('login');
      expect(categorization.recoverable).toBe(false);
    });

    it('categorizes unknown errors as default', () => {
      const error = new Error('unknown error');
      
      const categorization = reporter.categorizeError(error, {});
      
      expect(categorization.type).toBe('unknown');
      expect(categorization.severity).toBe('medium');
      expect(categorization.userAction).toBe('none');
      expect(categorization.recoverable).toBe(true);
    });
  });

  describe('Error Report Creation', () => {
    it('creates comprehensive error report', () => {
      const error = new Error('Test error');
      const errorInfo = {
        stepNumber: 1,
        stepName: 'Test Step',
        dealId: 'test-deal-123'
      };

      const report = reporter.createErrorReport(error, errorInfo);

      expect(report.errorId).toMatch(/dealwizard_/);
      expect(report.timestamp).toBeDefined();
      expect(report.error.message).toBe('Test error');
      expect(report.dealWizardContext.stepNumber).toBe(1);
      expect(report.dealWizardContext.stepName).toBe('Test Step');
      expect(report.dealWizardContext.dealId).toBe('test-deal-123');
      expect(report.userContext.userAgent).toBe('Mozilla/5.0 (Test Browser)');
      expect(report.appContext.mode).toBe('test');
      expect(report.categorization).toBeDefined();
    });

    it('includes performance context when available', () => {
      const error = new Error('Test error');
      const report = reporter.createErrorReport(error, {});

      expect(report.performanceContext.memoryUsage).toBeDefined();
      expect(report.performanceContext.memoryUsage.usedJSHeapSize).toBe(1000000);
      expect(report.performanceContext.navigationTiming).toBeDefined();
    });

    it('handles missing performance memory gracefully', () => {
      // Temporarily remove performance.memory
      const originalMemory = performance.memory;
      delete performance.memory;

      const error = new Error('Test error');
      const report = reporter.createErrorReport(error, {});

      expect(report.performanceContext.memoryUsage).toBeNull();

      // Restore
      performance.memory = originalMemory;
    });
  });

  describe('Error Reporting', () => {
    it('reports error to backend when enabled', async () => {
      reporter.setReportingEnabled(true);
      reporter.setReportingEndpoint('http://localhost:3000/api/errors');

      const error = new Error('Test error');
      const errorInfo = { stepNumber: 1 };

      await reporter.reportError(error, errorInfo);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/errors',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test error')
        })
      );
    });

    it('does not report to backend when disabled', async () => {
      reporter.setReportingEnabled(false);

      const error = new Error('Test error');
      await reporter.reportError(error, {});

      expect(fetch).not.toHaveBeenCalled();
    });

    it('handles backend reporting failures gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      reporter.setReportingEnabled(true);
      reporter.setReportingEndpoint('http://localhost:3000/api/errors');

      const error = new Error('Test error');
      
      // Should not throw
      await expect(reporter.reportError(error, {})).resolves.toBeUndefined();
    });

    it('adds error to queue and maintains size limit', () => {
      const error = new Error('Test error');
      
      // Add more errors than the queue limit
      for (let i = 0; i < 60; i++) {
        reporter.reportError(new Error(`Error ${i}`), {});
      }

      const analytics = reporter.getErrorAnalytics();
      expect(analytics.totalErrors).toBe(50); // maxQueueSize
    });
  });

  describe('Error Analytics', () => {
    it('provides comprehensive analytics', () => {
      // Add some test errors
      reporter.reportError(new Error('Network error'), { stepName: 'Step 1' });
      reporter.reportError(new Error('Validation error'), { stepName: 'Step 2' });
      reporter.reportError(new Error('Runtime error'), { stepName: 'Step 1' });

      const analytics = reporter.getErrorAnalytics();

      expect(analytics.totalErrors).toBe(3);
      expect(analytics.errorTypes).toBeDefined();
      expect(analytics.severityDistribution).toBeDefined();
      expect(analytics.stepDistribution).toBeDefined();
      expect(analytics.timeDistribution).toBeDefined();
    });

    it('counts errors by type correctly', () => {
      reporter.reportError(new Error('Network error'), {});
      reporter.reportError(new Error('Network error'), {});
      reporter.reportError(new Error('Validation error'), {});

      const analytics = reporter.getErrorAnalytics();

      expect(analytics.errorTypes.network).toBe(2);
      expect(analytics.errorTypes.validation).toBe(1);
    });

    it('counts errors by step correctly', () => {
      reporter.reportError(new Error('Error 1'), { stepName: 'Step 1' });
      reporter.reportError(new Error('Error 2'), { stepName: 'Step 1' });
      reporter.reportError(new Error('Error 3'), { stepName: 'Step 2' });

      const analytics = reporter.getErrorAnalytics();

      expect(analytics.stepDistribution['Step 1']).toBe(2);
      expect(analytics.stepDistribution['Step 2']).toBe(1);
    });
  });

  describe('Recovery Suggestions', () => {
    it('provides network error suggestions', () => {
      const error = new Error('fetch failed');
      error.name = 'NetworkError';

      const suggestions = reporter.getRecoverySuggestions(error, {});

      expect(suggestions).toContain('Check your internet connection');
      expect(suggestions).toContain('Try refreshing the page');
      expect(suggestions).toContain('Contact support if the problem persists');
    });

    it('provides validation error suggestions', () => {
      const error = new Error('validation failed');
      error.name = 'ValidationError';

      const suggestions = reporter.getRecoverySuggestions(error, {});

      expect(suggestions).toContain('Check your form inputs');
      expect(suggestions).toContain('Ensure all required fields are filled');
      expect(suggestions).toContain('Verify your data format');
    });

    it('provides runtime error suggestions', () => {
      const error = new Error('undefined is not a function');
      error.name = 'TypeError';

      const suggestions = reporter.getRecoverySuggestions(error, {});

      expect(suggestions).toContain('Refresh the page to reload the application');
      expect(suggestions).toContain('Clear your browser cache');
      expect(suggestions).toContain('Try using a different browser');
    });

    it('provides authorization error suggestions', () => {
      const error = new Error('unauthorized access');

      const suggestions = reporter.getRecoverySuggestions(error, {});

      expect(suggestions).toContain('Please log in again');
      expect(suggestions).toContain('Check your account permissions');
      expect(suggestions).toContain('Contact support for assistance');
    });

    it('provides default suggestions for unknown errors', () => {
      const error = new Error('unknown error');

      const suggestions = reporter.getRecoverySuggestions(error, {});

      expect(suggestions).toContain('Try refreshing the page');
      expect(suggestions).toContain('Contact support if the problem persists');
    });
  });

  describe('Error Recoverability', () => {
    it('identifies recoverable errors correctly', () => {
      const networkError = new Error('fetch failed');
      networkError.name = 'NetworkError';

      const validationError = new Error('validation failed');
      validationError.name = 'ValidationError';

      expect(reporter.isErrorRecoverable(networkError)).toBe(true);
      expect(reporter.isErrorRecoverable(validationError)).toBe(true);
    });

    it('identifies non-recoverable errors correctly', () => {
      const authError = new Error('unauthorized access');

      expect(reporter.isErrorRecoverable(authError)).toBe(false);
    });
  });

  describe('Queue Management', () => {
    it('clears error queue', () => {
      reporter.reportError(new Error('Test error'), {});
      expect(reporter.getErrorAnalytics().totalErrors).toBe(1);

      reporter.clearQueue();
      expect(reporter.getErrorAnalytics().totalErrors).toBe(0);
    });

    it('gets recent errors with limit', () => {
      // Add multiple errors
      for (let i = 0; i < 5; i++) {
        reporter.reportError(new Error(`Error ${i}`), {});
      }

      const recent = reporter.getRecentErrors(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].error.message).toBe('Error 4'); // Most recent first
    });
  });

  describe('Configuration', () => {
    it('enables/disables reporting', () => {
      expect(reporter.isReportingEnabled).toBe(false); // Default in test mode

      reporter.setReportingEnabled(true);
      expect(reporter.isReportingEnabled).toBe(true);

      reporter.setReportingEnabled(false);
      expect(reporter.isReportingEnabled).toBe(false);
    });

    it('sets reporting endpoint', () => {
      const endpoint = 'http://localhost:3000/api/errors';
      reporter.setReportingEndpoint(endpoint);
      expect(reporter.reportingEndpoint).toBe(endpoint);
    });
  });
}); 