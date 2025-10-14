/**
 * Hook for real-time deployment feedback integration with Cursor AI
 * Provides deployment status, error monitoring, and fix suggestions
 */

import { useState, useEffect, useCallback } from 'react';
import { deploymentMonitor } from '../utils/deployment-monitor.js';
import { logDeploymentEvent, logDeploymentError } from '../utils/logger.js';

export const useDeploymentFeedback = () => {
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [feedbackLoop, setFeedbackLoop] = useState({
    lastCommit: null,
    lastDeployment: null,
    lastError: null,
    fixSuggestions: []
  });

  // Subscribe to deployment events
  useEffect(() => {
    const unsubscribe = deploymentMonitor.subscribe((event, data) => {
      switch (event) {
        case 'deployment':
          setDeploymentStatus(data);
          logDeploymentEvent('status_update', data);
          break;
        
        case 'errors':
          setErrors(prev => [...prev, ...data]);
          logDeploymentEvent('new_errors', { count: data.length });
          break;
        
        case 'deployment-error':
          logDeploymentError(new Error(data.message), data.context);
          setFeedbackLoop(prev => ({
            ...prev,
            lastError: data,
            fixSuggestions: generateFixSuggestions(data)
          }));
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    deploymentMonitor.startMonitoring();
    setIsMonitoring(true);
    logDeploymentEvent('monitoring_started');
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    deploymentMonitor.stopMonitoring();
    setIsMonitoring(false);
    logDeploymentEvent('monitoring_stopped');
  }, []);

  // Check deployment status
  const checkStatus = useCallback(async () => {
    try {
      const status = await deploymentMonitor.checkDeploymentStatus();
      setDeploymentStatus(status);
      return status;
    } catch (error) {
      logDeploymentError(error, { context: 'status_check' });
      return null;
    }
  }, []);

  // Check for new errors
  const checkErrors = useCallback(async () => {
    try {
      const newErrors = await deploymentMonitor.checkForNewErrors();
      setErrors(prev => [...prev, ...newErrors]);
      return newErrors;
    } catch (error) {
      logDeploymentError(error, { context: 'error_check' });
      return [];
    }
  }, []);

  // Generate fix suggestions based on error context
  const generateFixSuggestions = (error) => {
    const suggestions = [];
    
    if (error.type === 'deployment') {
      suggestions.push({
        type: 'deployment',
        suggestion: 'Check build logs for compilation errors',
        action: 'view_build_logs'
      });
    }
    
    if (error.severity === 'high') {
      suggestions.push({
        type: 'urgent',
        suggestion: 'High severity error detected - immediate attention required',
        action: 'create_issue'
      });
    }
    
    return suggestions;
  };

  // Get current feedback loop status
  const getFeedbackStatus = useCallback(() => {
    return {
      deployment: deploymentStatus,
      errors: errors,
      monitoring: isMonitoring,
      feedbackLoop: feedbackLoop,
      status: deploymentMonitor.getStatus()
    };
  }, [deploymentStatus, errors, isMonitoring, feedbackLoop]);

  // Auto-start monitoring in development
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    deploymentStatus,
    errors,
    isMonitoring,
    feedbackLoop,
    startMonitoring,
    stopMonitoring,
    checkStatus,
    checkErrors,
    getFeedbackStatus
  };
};

export default useDeploymentFeedback;
