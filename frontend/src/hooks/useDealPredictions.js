import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for deal prediction operations
 * Provides CRUD operations with loading and error states
 * Follows existing hook patterns from the codebase
 */
const useDealPredictions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // API base URL - use environment variable like other API calls  
  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      throw new Error('Authentication error: ' + error.message);
    }
  }, []);

  // Store clearinghouse prediction for a deal
  const storeClearinghousePrediction = useCallback(async (dealId, predictionData) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/deals/${dealId}/clearinghouse-prediction`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(predictionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to store clearinghouse prediction`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to store clearinghouse prediction';
      setError(errorMessage);
      console.error('Error storing clearinghouse prediction:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Store valuation prediction for a deal
  const storeValuationPrediction = useCallback(async (dealId, predictionData) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/deals/${dealId}/valuation-prediction`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(predictionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to store valuation prediction`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to store valuation prediction';
      setError(errorMessage);
      console.error('Error storing valuation prediction:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch prediction data for a deal
  const fetchPrediction = useCallback(async (dealId, predictionType) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/deals/${dealId}/prediction/${predictionType}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch ${predictionType} prediction`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || `Failed to load ${predictionType} prediction`;
      setError(errorMessage);
      console.error('Error fetching prediction:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry functionality for failed requests
  const retryLastOperation = useCallback(async (operation, ...args) => {
    clearError();
    
    try {
      switch (operation) {
        case 'storeClearinghouse':
          return await storeClearinghousePrediction(...args);
        case 'storeValuation':
          return await storeValuationPrediction(...args);
        case 'fetch':
          return await fetchPrediction(...args);
        default:
          throw new Error('Unknown operation');
      }
    } catch (err) {
      // Error is already handled in individual functions
      throw err;
    }
  }, [storeClearinghousePrediction, storeValuationPrediction, fetchPrediction, clearError]);

  return {
    loading,
    error,
    storeClearinghousePrediction,
    storeValuationPrediction,
    fetchPrediction,
    clearError,
    retryLastOperation
  };
};

export default useDealPredictions; 