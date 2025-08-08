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

// Field mapping utility functions for backend schema
const getCompensationCash = (deal) => {
  try {
    return deal?.compensation_cash || 0;
  } catch (error) {
    dealLogger.error('Error accessing compensation_cash', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getCompensationCash' },
      extra: { dealId: deal?.id }
    });
    return 0;
  }
};

const getCompensationGoods = (deal) => {
  try {
    return deal?.compensation_goods || [];
  } catch (error) {
    dealLogger.error('Error accessing compensation_goods', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getCompensationGoods' },
      extra: { dealId: deal?.id }
    });
    return [];
  }
};

const getCompensationOther = (deal) => {
  try {
    return deal?.compensation_other || [];
  } catch (error) {
    dealLogger.error('Error accessing compensation_other', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getCompensationOther' },
      extra: { dealId: deal?.id }
    });
    return [];
  }
};

const getPayorName = (deal) => {
  try {
    return deal?.payor_name || 'Not specified';
  } catch (error) {
    dealLogger.error('Error accessing payor_name', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getPayorName' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getPayorType = (deal) => {
  try {
    return deal?.payor_type || 'Not specified';
  } catch (error) {
    dealLogger.error('Error accessing payor_type', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getPayorType' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getUniversity = (deal) => {
  try {
    return deal?.university || 'Not specified';
  } catch (error) {
    dealLogger.error('Error accessing university', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getUniversity' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getSports = (deal) => {
  try {
    if (!deal?.sports || !Array.isArray(deal.sports)) {
      return 'Not specified';
    }
    return deal.sports.join(', ');
  } catch (error) {
    dealLogger.error('Error accessing sports', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getSports' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getDealNickname = (deal) => {
  try {
    return deal?.deal_nickname || 'Untitled Deal';
  } catch (error) {
    dealLogger.error('Error accessing deal_nickname', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getDealNickname' },
      extra: { dealId: deal?.id }
    });
    return 'Untitled Deal';
  }
};

const getContactName = (deal) => {
  try {
    return deal?.contact_name || 'Not specified';
  } catch (error) {
    dealLogger.error('Error accessing contact_name', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getContactName' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getContactEmail = (deal) => {
  try {
    return deal?.contact_email || 'Not specified';
  } catch (error) {
    dealLogger.error('Error accessing contact_email', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getContactEmail' },
      extra: { dealId: deal?.id }
    });
    return 'Not specified';
  }
};

const getObligations = (deal) => {
  try {
    return deal?.obligations || {};
  } catch (error) {
    dealLogger.error('Error accessing obligations', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getObligations' },
      extra: { dealId: deal?.id }
    });
    return {};
  }
};

const getTotalCompensation = (deal) => {
  try {
    let total = 0;
    
    // Add cash compensation
    const cash = getCompensationCash(deal);
    total += parseFloat(cash) || 0;
    
    // Add goods compensation
    const goods = getCompensationGoods(deal);
    if (Array.isArray(goods)) {
      total += goods.reduce((sum, item) => {
        return sum + (parseFloat(item.value || item.estimated_value) || 0);
      }, 0);
    }
    
    // Add other compensation
    const other = getCompensationOther(deal);
    if (Array.isArray(other)) {
      total += other.reduce((sum, item) => {
        return sum + (parseFloat(item.estimated_value) || 0);
      }, 0);
    }
    
    return total;
  } catch (error) {
    dealLogger.error('Error calculating total compensation', { error: error.message, dealId: deal?.id });
    Sentry.captureException(error, {
      tags: { component: 'DealContext', action: 'getTotalCompensation' },
      extra: { dealId: deal?.id }
    });
    return 0;
  }
};

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
          deal.id === parseInt(dealId) ? { ...deal, ...data } : deal
        )
      );

      // Also update the currentDeal if it matches the updated deal
      setCurrentDeal(prevCurrentDeal => {
        const shouldUpdate = prevCurrentDeal && prevCurrentDeal.id === parseInt(dealId);
        console.log('[DealContext] Updating currentDeal:', {
          prevCurrentDealId: prevCurrentDeal?.id,
          dealId: parseInt(dealId),
          shouldUpdate,
          newData: data
        });
        return shouldUpdate ? { ...prevCurrentDeal, ...data } : prevCurrentDeal;
      });

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

    // Prevent fetching if we're already loading the same deal
    if (loading && currentDeal?.id?.toString() === dealId) {
      console.log('[DealContext] Already loading this deal, skipping fetch');
      return;
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
      console.log('[DealContext] Current deal state updated:', data);

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
    currentDeal,
    deal: currentDeal, // Backward compatibility
    // Field mapping functions for backend schema
    getCompensationCash,
    getCompensationGoods,
    getCompensationOther,
    getPayorName,
    getPayorType,
    getUniversity,
    getSports,
    getDealNickname,
    getContactName,
    getContactEmail,
    getObligations,
    getTotalCompensation
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
};
