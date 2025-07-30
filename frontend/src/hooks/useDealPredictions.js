import { useState, useEffect } from 'react';

/**
 * Custom hook for managing deal predictions (clearinghouse and valuation)
 * Used by the prediction workflows to store and retrieve prediction data
 */
export const useDealPredictions = (dealId) => {
  const [clearinghousePrediction, setClearinghousePrediction] = useState(null);
  const [valuationPrediction, setValuationPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveClearinghousePrediction = async (prediction) => {
    try {
      setLoading(true);
      setError(null);

      if (!dealId) {
        throw new Error('Deal ID is required');
      }

      // For now, store in localStorage until backend API is ready
      const key = `clearinghouse_prediction_${dealId}`;
      localStorage.setItem(key, JSON.stringify(prediction));

      setClearinghousePrediction(prediction);
      return prediction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveValuationPrediction = async (prediction) => {
    try {
      setLoading(true);
      setError(null);

      if (!dealId) {
        throw new Error('Deal ID is required');
      }

      // For now, store in localStorage until backend API is ready
      const key = `valuation_prediction_${dealId}`;
      localStorage.setItem(key, JSON.stringify(prediction));

      setValuationPrediction(prediction);
      return prediction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (predictionType) => {
    try {
      setLoading(true);
      setError(null);

      if (!dealId) {
        throw new Error('Deal ID is required');
      }

      // For now, fetch from localStorage until backend API is ready
      const key = `${predictionType}_prediction_${dealId}`;
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null; // No prediction found
      }

      const result = JSON.parse(stored);

      if (predictionType === 'clearinghouse') {
        setClearinghousePrediction(result);
      } else if (predictionType === 'valuation') {
        setValuationPrediction(result);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load predictions on mount if dealId is available
  useEffect(() => {
    if (dealId) {
      fetchPrediction('clearinghouse').catch(() => {
        // Ignore errors for missing predictions
      });
      fetchPrediction('valuation').catch(() => {
        // Ignore errors for missing predictions
      });
    }
  }, [dealId]);

  return {
    clearinghousePrediction,
    valuationPrediction,
    loading,
    error,
    saveClearinghousePrediction,
    saveValuationPrediction,
    fetchPrediction
  };
};

// Also export as default for compatibility
export default useDealPredictions;