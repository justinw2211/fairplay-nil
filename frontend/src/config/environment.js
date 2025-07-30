/**
 * Environment Configuration for FairPlay NIL
 * Centralized configuration for all environments with proper deployment support
 */

// Environment detection with deployment support
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
const isStaging = import.meta.env.MODE === 'staging' || import.meta.env.VITE_ENVIRONMENT === 'staging';
const isPreview = import.meta.env.VITE_VERCEL_ENV === 'preview';

// Deployment environment detection
const deploymentEnvironment = import.meta.env.VITE_VERCEL_ENV || 'development';
const isVercelProduction = deploymentEnvironment === 'production';
const isVercelPreview = deploymentEnvironment === 'preview';

// Environment configuration
export const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    debug: true,
    logLevel: 'debug',
    enableErrorTracking: false,
    enablePerformanceMonitoring: true,
    enableVerboseLogging: true,
    enableErrorSimulation: false,
    enableDebugMode: true,
    sentrySampleRate: 1.0,
    enableConsoleOutput: true
  },
  staging: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://staging-api.fairplay-nil.com',
    debug: false,
    logLevel: 'info',
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableVerboseLogging: false,
    enableErrorSimulation: false,
    enableDebugMode: false,
    sentrySampleRate: 0.5,
    enableConsoleOutput: false
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.fairplay-nil.com',
    debug: false,
    logLevel: 'error',
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableVerboseLogging: false,
    enableErrorSimulation: false,
    enableDebugMode: false,
    sentrySampleRate: 0.1,
    enableConsoleOutput: false
  }
};

// Get current environment config
export const getConfig = () => {
  if (isDevelopment) {
    return config.development;
  }
  if (isStaging || isVercelPreview) {
    return config.staging;
  }
  return config.production;
};

// Error tracking configuration
export const errorTrackingConfig = {
  // Sentry Configuration
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    enabled: getConfig().enableErrorTracking && !!import.meta.env.VITE_SENTRY_DSN,
    environment: deploymentEnvironment,
    debug: isDevelopment,

    // Performance Monitoring
    tracesSampleRate: getConfig().sentrySampleRate,

    // Session Replay
    replaysSessionSampleRate: getConfig().sentrySampleRate,
    replaysOnErrorSampleRate: 1.0,

    // Error Sampling
    errorSampleRate: getConfig().sentrySampleRate,

    // Context and Tags
    defaultTags: {
      environment: deploymentEnvironment,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
      deployment: deploymentEnvironment
    }
  },

  // Logger Configuration
  logger: {
    level: getConfig().logLevel,
    enableConsoleOutput: getConfig().enableConsoleOutput,
    enableSentryReporting: getConfig().enableErrorTracking,
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
    enableErrorReporting: getConfig().enableErrorTracking,
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
    enabled: getConfig().enableErrorTracking,
    endpoint: getConfig().apiUrl ? `${getConfig().apiUrl}/api/errors` : null,
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
    enableVerboseLogging: getConfig().enableVerboseLogging,
    enableErrorSimulation: getConfig().enableErrorSimulation,
    enablePerformanceMonitoring: getConfig().enablePerformanceMonitoring,
    enableDebugMode: getConfig().enableDebugMode
  },

  // Production-specific settings
  production: {
    enableVerboseLogging: getConfig().enableVerboseLogging,
    enableErrorSimulation: false,
    enablePerformanceMonitoring: getConfig().enablePerformanceMonitoring,
    enableDebugMode: getConfig().enableDebugMode,
    enableErrorSampling: true
  }
};

// Environment validation
export const validateEnvironmentConfig = () => {
  const errors = [];
  const currentConfig = getConfig();

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

  // Validate API URL format
  if (currentConfig.apiUrl && !currentConfig.apiUrl.startsWith('http')) {
    errors.push('API URL must be a valid HTTP/HTTPS URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
    environment: deploymentEnvironment,
    config: currentConfig
  };
};

// Helper functions for environment-specific behavior
export const isErrorTrackingEnabled = () => {
  return errorTrackingConfig.sentry.enabled || errorTrackingConfig.apiErrorReporting.enabled;
};

export const shouldLogError = (error, _context = 'general') => {
  // Always log in development
  if (isDevelopment) {
    return true;
  }

  // In production, respect sampling rates
  if (isProduction) {
    const sampleRate = errorTrackingConfig.sentry.errorSampleRate;
    return Math.random() < sampleRate;
  }

  return true;
};

export const getErrorContext = (context = 'general') => {
  return {
    environment: deploymentEnvironment,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    deployment: deploymentEnvironment
  };
};

// Deployment helpers
export const isDeploymentEnvironment = () => {
  return isVercelProduction || isVercelPreview;
};

export const getDeploymentInfo = () => {
  return {
    environment: deploymentEnvironment,
    isProduction: isVercelProduction,
    isPreview: isVercelPreview,
    isDevelopment: isDevelopment,
    apiUrl: getConfig().apiUrl,
    errorTrackingEnabled: isErrorTrackingEnabled()
  };
};

// Export environment detection helpers
export {
  isDevelopment,
  isProduction,
  isStaging,
  isPreview,
  isVercelProduction,
  isVercelPreview,
  deploymentEnvironment
};

export default errorTrackingConfig;