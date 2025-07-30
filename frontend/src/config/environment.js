/**
 * Environment Configuration for Error Tracking
 * Centralized configuration for error tracking and monitoring across environments
 */

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
const isStaging = import.meta.env.MODE === 'staging' || import.meta.env.VITE_ENVIRONMENT === 'staging';

// Error tracking configuration
export const errorTrackingConfig = {
  // Sentry Configuration
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    enabled: isProduction || !!import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    debug: isDevelopment,

    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Error Sampling
    errorSampleRate: isProduction ? 0.5 : 1.0,

    // Context and Tags
    defaultTags: {
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    }
  },

  // Logger Configuration
  logger: {
    level: isDevelopment ? 'debug' : 'info',
    enableConsoleOutput: true,
    enableSentryReporting: isProduction || !!import.meta.env.VITE_SENTRY_DSN,
    sanitizeSensitiveData: true,

    // Context-specific settings
    contexts: {
      errorBoundary: {
        enableDetailedLogging: true,
        includeComponentStack: true,
        includeUserContext: true
      },
      dealWizard: {
        enableStepTracking: true,
        includeDealContext: true,
        enableRecoveryLogging: true
      },
      api: {
        enableRequestLogging: isDevelopment,
        enableResponseLogging: isDevelopment,
        includeHeaders: false
      }
    }
  },

  // Error Boundary Configuration
  errorBoundary: {
    enableRetry: true,
    showErrorDetails: isDevelopment,
    enableErrorReporting: true,
    maxRetryAttempts: 3,

    // Fallback UI settings
    fallback: {
      showTechnicalDetails: isDevelopment,
      enableErrorIdDisplay: true,
      enableContextDisplay: true
    }
  },

  // API Error Reporting
  apiErrorReporting: {
    enabled: isProduction || !!import.meta.env.VITE_API_URL,
    endpoint: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/errors` : null,
    timeout: 5000,
    retryAttempts: 2,

    // Error categorization
    categories: {
      critical: ['authentication', 'payment', 'compliance'],
      high: ['deal_creation', 'data_validation', 'api_integration'],
      medium: ['ui_interaction', 'form_validation', 'navigation'],
      low: ['analytics', 'logging', 'debugging']
    }
  },

  // Development-specific settings
  development: {
    enableVerboseLogging: true,
    enableErrorSimulation: false,
    enablePerformanceMonitoring: true,
    enableDebugMode: true
  },

  // Production-specific settings
  production: {
    enableVerboseLogging: false,
    enableErrorSimulation: false,
    enablePerformanceMonitoring: true,
    enableDebugMode: false,
    enableErrorSampling: true
  }
};

// Environment validation
export const validateEnvironmentConfig = () => {
  const errors = [];

  // Validate required environment variables
  if (isProduction && !import.meta.env.VITE_SENTRY_DSN) {
    errors.push('VITE_SENTRY_DSN is required in production environment');
  }

  if (isProduction && !import.meta.env.VITE_API_URL) {
    errors.push('VITE_API_URL is required in production environment');
  }

  // Validate configuration consistency
  if (errorTrackingConfig.sentry.enabled && !errorTrackingConfig.sentry.dsn) {
    errors.push('Sentry is enabled but no DSN is provided');
  }

  if (errorTrackingConfig.apiErrorReporting.enabled && !errorTrackingConfig.apiErrorReporting.endpoint) {
    errors.push('API error reporting is enabled but no endpoint is configured');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions for environment-specific behavior
export const isErrorTrackingEnabled = () => {
  return errorTrackingConfig.sentry.enabled || errorTrackingConfig.apiErrorReporting.enabled;
};

export const shouldLogError = (error, context = 'general') => {
  // Always log in development
  if (isDevelopment) {return true;}

  // In production, respect sampling rates
  if (isProduction) {
    const sampleRate = errorTrackingConfig.sentry.errorSampleRate;
    return Math.random() < sampleRate;
  }

  return true;
};

export const getErrorContext = (context = 'general') => {
  return {
    environment: import.meta.env.MODE,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
  };
};

// Export environment detection helpers
export { isDevelopment, isProduction, isStaging };

export default errorTrackingConfig;