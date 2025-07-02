// frontend/src/context/DealContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DealContext = createContext();

export const useDeal = () => useContext(DealContext);

export const DealProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Centralized helper for all authenticated API calls with logging
  const authenticatedFetch = async (url, options = {}) => {
    console.log(`[DealContext] Starting API call: ${options.method || 'GET'} ${url}`);
    
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      
      if (!token) {
        console.error("[DealContext] Auth fetch failed: No token available.");
        throw new Error("Authentication error: Your session may have expired. Please log in again.");
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Add this to ensure cookies are sent
      });

      console.log(`[DealContext] API call complete for: ${url} with status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use text content
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[DealContext] API Error:`, error);
      throw error;
    }
  };

  const createDraftDeal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals`, { 
        method: 'POST' 
      });
      const newDraft = response;
      setDeal(newDraft);
      navigate(`/add/deal/terms/${newDraft.id}`);
      return newDraft;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw to allow handling by the caller
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateDeal = useCallback(async (dealId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const updatedDeal = response;
      setDeal(updatedDeal);
      return updatedDeal;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchDealById = useCallback(async (dealId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals`, { 
        method: 'GET' 
      });
      // Handle the new response format which includes deals in a nested property
      const deals = response.deals || response;
      const specificDeal = deals.find(d => d.id.toString() === dealId.toString());
      
      if (!specificDeal) {
        throw new Error("Deal not found.");
      }
      
      setDeal(specificDeal);
      return specificDeal;
    } catch (err) {
      setError(err.message);
      navigate('/dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const value = {
    deal,
    loading,
    error,
    createDraftDeal,
    updateDeal,
    fetchDealById,
    setDeal,
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};

// ✅ This enables named import: { DealContext }
export { DealContext };
