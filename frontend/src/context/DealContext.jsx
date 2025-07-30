// frontend/src/context/DealContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { createLogger } from '../utils/logger';
import * as Sentry from '@sentry/react';

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
  const [currentDeal, setCurrentDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: _user } = useAuth(); // Prefix with underscore to indicate intentionally unused

  const createDraftDeal = useCallback(async (dealType) => {
    console.log('[DealContext] createDraftDeal called with dealType:', dealType);

    if (!_user) {
      console.error('[DealContext] No user authenticated for deal creation');
      throw new Error('User must be authenticated to create a deal');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[DealContext] Getting session for deal creation...');
      dealLogger.debug('Starting API call: POST');

      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        console.error('[DealContext] No authentication token available for deal creation');
        throw new Error('No authentication token available');
      }

      console.log('[DealContext] Making API request to create deal...');
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

      console.log('[DealContext] Create deal API response status:', response.status);
      console.log('[DealContext] Create deal API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DealContext] Create deal API error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DealContext] Deal created successfully:', data);
      dealLogger.debug(`API call complete with status: ${response.status}`);

      // Add the new deal to the deals list
      setDeals(prevDeals => [...prevDeals, data]);

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create deal';
      console.error('[DealContext] Error creating deal:', errorMessage);
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

    // Track updateDeal start
    Sentry.captureMessage('DealContext: updateDeal started', 'info', {
      tags: {
        component: 'DealContext',
        action: 'updateDeal_start',
        dealId
      },
      extra: {
        dealId,
        updates,
        userId: _user?.id
      }
    });

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Track API request
      Sentry.captureMessage('DealContext: Making API request', 'info', {
        tags: {
          component: 'DealContext',
          action: 'api_request',
          dealId
        },
        extra: {
          dealId,
          apiUrl: `${import.meta.env.VITE_API_URL}/api/deals/${dealId}`,
          hasToken: !!token
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      // Track API response
      Sentry.captureMessage('DealContext: API response received', 'info', {
        tags: {
          component: 'DealContext',
          action: 'api_response',
          dealId
        },
        extra: {
          dealId,
          responseStatus: response.status,
          responseOk: response.ok,
          responseStatusText: response.statusText
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Track successful data parsing
      Sentry.captureMessage('DealContext: Data parsed successfully', 'info', {
        tags: {
          component: 'DealContext',
          action: 'data_parsed',
          dealId
        },
        extra: {
          dealId,
          dataKeys: Object.keys(data)
        }
      });

      // Update the deal in the deals list
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId ? { ...deal, ...data } : deal
        )
      );

      // Also update the currentDeal if it matches the updated deal
      setCurrentDeal(prevCurrentDeal =>
        prevCurrentDeal && prevCurrentDeal.id === dealId ? { ...prevCurrentDeal, ...data } : prevCurrentDeal
      );

      // Track successful state updates
      Sentry.captureMessage('DealContext: State updated successfully', 'info', {
        tags: {
          component: 'DealContext',
          action: 'state_updated',
          dealId
        },
        extra: {
          dealId,
          updatedDataKeys: Object.keys(data)
        }
      });

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update deal';

      // Track error with detailed context
      Sentry.captureException(err, {
        tags: {
          component: 'DealContext',
          action: 'updateDeal_error',
          dealId
        },
        extra: {
          dealId,
          updates,
          userId: _user?.id,
          errorMessage,
          errorStack: err.stack
        }
      });

      dealLogger.error('Error updating deal', { error: errorMessage });
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [_user]);

  const fetchDealById = useCallback(async (dealId) => {
    console.log('[DealContext] fetchDealById called with dealId:', dealId);

    if (!_user) {
      console.error('[DealContext] No user authenticated');
      throw new Error('User must be authenticated to fetch a deal');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[DealContext] Getting session...');
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        console.error('[DealContext] No authentication token available');
        throw new Error('No authentication token available');
      }

      console.log('[DealContext] Making API request to fetch deal...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DealContext] API response status:', response.status);
      console.log('[DealContext] API response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DealContext] API error:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DealContext] Deal data received:', data);

      // Set the current deal in state
      setCurrentDeal(data);

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch deal';
      console.error('[DealContext] Error fetching deal:', errorMessage);
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
    fetchDealById,
    currentDeal
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
};
