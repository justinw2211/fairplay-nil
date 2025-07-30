// frontend/src/context/DealContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { createLogger } from '../utils/logger';

// Create logger instance for this context
const dealLogger = createLogger('DealContext');

// Create context
const DealContext = createContext();

// Custom hook to use deal context
export const useDeal = () => {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};

// Provider component
export const DealProvider = ({ children }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: _user } = useAuth(); // Prefix with underscore to indicate intentionally unused

  const createDraftDeal = useCallback(async (dealType) => {
    if (!_user) {
      throw new Error('User must be authenticated to create a deal');
    }

    setLoading(true);
    setError(null);

    try {
      dealLogger.debug('Starting API call: POST');

      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deal_type: dealType,
          status: 'draft'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      dealLogger.debug(`API call complete with status: ${response.status}`);

      // Add the new deal to the deals list
      setDeals(prevDeals => [...prevDeals, data]);

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create deal';
      dealLogger.error('Error creating deal', { error: errorMessage });
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [_user]);

  const updateDeal = useCallback(async (dealId, updates) => {
    if (!_user) {
      throw new Error('User must be authenticated to update a deal');
    }

    setLoading(true);
    setError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the deal in the deals list
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId ? { ...deal, ...data } : deal
        )
      );

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update deal';
      dealLogger.error('Error updating deal', { error: errorMessage });
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [_user]);

  const fetchDealById = useCallback(async (dealId) => {
    if (!_user) {
      throw new Error('User must be authenticated to fetch a deal');
    }

    setLoading(true);
    setError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch deal';
      dealLogger.error('Error fetching deal', { error: errorMessage });
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [_user]);

  const value = {
    deals,
    setDeals,
    loading,
    error,
    createDraftDeal,
    updateDeal,
    fetchDealById
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
};
