/**
 * Secure logging utility for FairPlay NIL
 * Filters sensitive data and respects environment settings
 */

import * as Sentry from '@sentry/react';

const isDevelopment = import.meta.env.MODE === 'development';

// Sensitive data patterns to filter out
const SENSITIVE_PATTERNS = [
  /email/i,
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /auth/i,
  /session/i,
  /bearer/i,
  /jwt/i,
  /phone/i,
  /ssn/i,
  /compensation/i,
  /payment/i,
  /financial/i
];

// Filter sensitive data from objects
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {return data;}

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(sanitized).forEach(key => {
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _log(level, message, data = null) {
    if (!isDevelopment && level === LOG_LEVELS.DEBUG) {
      return; // Don't log debug messages in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`;

    if (data) {
      const sanitizedData = sanitizeData(data);
      console[level](prefix, message, sanitizedData);
    } else {
      console[level](prefix, message);
    }
  }

  error(message, data = null) {
    // Log the error first (existing functionality)
    this._log(LOG_LEVELS.ERROR, message, data);

    // Report to Sentry with enhanced context
    try {
      // Create error object for Sentry if message is not already an Error
      const error = message instanceof Error ? message : new Error(message);

      Sentry.captureException(error, {
        contexts: {
          logger: {
            context: this.context,
            message: message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        },
        tags: {
          logger: 'true',
          context: this.context,
          level: 'error'
        },
        extra: {
          loggerMessage: message,
          loggerData: data ? sanitizeData(data) : null,
          loggerContext: this.context
        }
      });
    } catch (sentryError) {
      // Fallback if Sentry fails - don't break existing logging
      console.warn('Sentry error reporting failed in logger:', sentryError.message);
    }
  }

  warn(message, data = null) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }
}

// Create logger instances for different contexts
export const createLogger = (context) => new Logger(context);

// Default logger
export const logger = new Logger();

// Common logger instances
export const authLogger = new Logger('AuthContext');
export const dealLogger = new Logger('DealContext');
export const apiLogger = new Logger('API');
export const formLogger = new Logger('Form');
export const deploymentLogger = new Logger('Deployment');

// Deployment-specific logging functions
export const logDeploymentEvent = (event, data = {}) => {
  const deploymentContext = {
    event,
    deployment: {
      environment: import.meta.env.VITE_VERCEL_ENV || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    },
    ...data
  };

  deploymentLogger.info(`Deployment event: ${event}`, deploymentContext);
};

export const logDeploymentError = (error, context = {}) => {
  const errorContext = {
    ...context,
    deployment: {
      environment: import.meta.env.VITE_VERCEL_ENV || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    },
    errorType: 'deployment',
    timestamp: new Date().toISOString()
  };

  deploymentLogger.error(`Deployment error: ${error.message}`, errorContext);
};

export default logger;