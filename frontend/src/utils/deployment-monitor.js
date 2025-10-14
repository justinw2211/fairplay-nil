/**
 * Deployment Monitoring Utility
 * Provides real-time feedback on deployment status and errors
 */

import { logger } from './logger.js';

class DeploymentMonitor {
  constructor() {
    this.deploymentStatus = null;
    this.errorCount = 0;
    this.lastErrorCheck = null;
    this.listeners = new Set();
  }

  // Monitor deployment status
  async checkDeploymentStatus() {
    try {
      // Check Vercel deployment status via API
      const response = await fetch('/api/deployment-status');
      const data = await response.json();
      
      this.deploymentStatus = data;
      this.notifyListeners('deployment', data);
      
      if (data.status === 'error') {
        logger.error('Deployment failed:', data.error);
        this.handleDeploymentError(data.error);
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to check deployment status:', error);
      return null;
    }
  }

  // Monitor for new Sentry errors
  async checkForNewErrors() {
    try {
      const response = await fetch('/api/sentry/errors?since=' + this.lastErrorCheck);
      const errors = await response.json();
      
      if (errors.length > 0) {
        this.errorCount += errors.length;
        this.notifyListeners('errors', errors);
        logger.warn(`New errors detected: ${errors.length}`);
      }
      
      this.lastErrorCheck = new Date().toISOString();
      return errors;
    } catch (error) {
      logger.error('Failed to check for errors:', error);
      return [];
    }
  }

  // Handle deployment errors
  handleDeploymentError(error) {
    const errorInfo = {
      type: 'deployment',
      message: error.message,
      timestamp: new Date().toISOString(),
      severity: 'high',
      context: {
        deployment: this.deploymentStatus,
        environment: process.env.NODE_ENV
      }
    };

    // Report to Sentry
    if (window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        tags: { type: 'deployment' },
        extra: errorInfo
      });
    }

    this.notifyListeners('deployment-error', errorInfo);
  }

  // Subscribe to deployment events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        logger.error('Error in deployment monitor callback:', error);
      }
    });
  }

  // Start monitoring
  startMonitoring(interval = 30000) {
    this.monitoringInterval = setInterval(async () => {
      await this.checkDeploymentStatus();
      await this.checkForNewErrors();
    }, interval);

    logger.info('Deployment monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Deployment monitoring stopped');
    }
  }

  // Get current status
  getStatus() {
    return {
      deployment: this.deploymentStatus,
      errorCount: this.errorCount,
      lastErrorCheck: this.lastErrorCheck,
      isMonitoring: !!this.monitoringInterval
    };
  }
}

// Create singleton instance
export const deploymentMonitor = new DeploymentMonitor();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  deploymentMonitor.startMonitoring();
}

export default deploymentMonitor;
