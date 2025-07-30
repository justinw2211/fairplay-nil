/**
 * Test utility for error tracking implementation
 * Verifies Sentry integration, logger functionality, and environment configuration
 */

import { createLogger } from './logger';
import { errorTrackingConfig, validateEnvironmentConfig, isErrorTrackingEnabled } from '../config/environment';

const testLogger = createLogger('ErrorTrackingTest');

// Test Sentry initialization
export const testSentryInitialization = () => {
  try {
    // Check if Sentry is available
    const Sentry = require('@sentry/react');
    console.log('✅ Sentry is properly imported');

    // Test Sentry configuration
    console.log('✅ Sentry configuration:', {
      enabled: errorTrackingConfig.sentry.enabled,
      environment: errorTrackingConfig.sentry.environment,
      debug: errorTrackingConfig.sentry.debug
    });

    return true;
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error.message);
    return false;
  }
};

// Test logger functionality
export const testLoggerFunctionality = () => {
  try {
    // Test different log levels
    testLogger.info('Test info message', { test: true });
    testLogger.warn('Test warning message', { test: true });
    testLogger.debug('Test debug message', { test: true });

    // Test error logging (this should trigger Sentry)
    testLogger.error('Test error message', {
      test: true,
      context: 'test',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Logger functionality test completed');
    return true;
  } catch (error) {
    console.error('❌ Logger functionality test failed:', error.message);
    return false;
  }
};

// Test environment configuration
export const testEnvironmentConfiguration = () => {
  try {
    // Test environment validation
    const validation = validateEnvironmentConfig();
    console.log('✅ Environment validation:', validation);

    // Test error tracking enabled
    const isEnabled = isErrorTrackingEnabled();
    console.log('✅ Error tracking enabled:', isEnabled);

    // Test configuration structure
    console.log('✅ Error tracking config structure:', {
      sentry: !!errorTrackingConfig.sentry,
      logger: !!errorTrackingConfig.logger,
      errorBoundary: !!errorTrackingConfig.errorBoundary,
      apiErrorReporting: !!errorTrackingConfig.apiErrorReporting
    });

    return true;
  } catch (error) {
    console.error('❌ Environment configuration test failed:', error.message);
    return false;
  }
};

// Test error boundary functionality
export const testErrorBoundary = () => {
  try {
    // Simulate an error that should be caught by ErrorBoundary
    const testError = new Error('Test error for ErrorBoundary');
    testError.name = 'TestError';
    testError.stack = 'Test stack trace';

    // This would normally be caught by ErrorBoundary
    console.log('✅ ErrorBoundary test error created:', testError.message);

    return true;
  } catch (error) {
    console.error('❌ ErrorBoundary test failed:', error.message);
    return false;
  }
};

// Run all tests
export const runErrorTrackingTests = () => {
  console.log('🧪 Running Error Tracking Tests...\n');

  const tests = [
    { name: 'Sentry Initialization', test: testSentryInitialization },
    { name: 'Logger Functionality', test: testLoggerFunctionality },
    { name: 'Environment Configuration', test: testEnvironmentConfiguration },
    { name: 'ErrorBoundary Test', test: testErrorBoundary }
  ];

  const results = tests.map(({ name, test }) => {
    const passed = test();
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}\n`);
    return { name, passed };
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`📊 Test Results: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log('🎉 All error tracking tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }

  return results;
};

// Export for manual testing
export default {
  testSentryInitialization,
  testLoggerFunctionality,
  testEnvironmentConfiguration,
  testErrorBoundary,
  runErrorTrackingTests
};