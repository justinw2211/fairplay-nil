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

  // *** NEW: A centralized helper function for all authenticated API calls with detailed logging ***
  const authenticatedFetch = async (url, options = {}) => {
    console.log(`[DealContext] Starting API call: ${options.method || 'GET'} ${url}`);
    
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
    });

    console.log(`[DealContext] API call complete for: ${url} with status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DealContext] API Error Response for ${url}:`, { status: response.status, body: errorBody });
      throw new Error(`API request failed with status ${response.status}.`);
    }
    
    return response.json();
  };

  const createDraftDeal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newDraft = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals`, { method: 'POST' });
      setDeal(newDraft);
      navigate(`/add/deal/terms/${newDraft.id}`);
      return newDraft;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const updateDeal = useCallback(async (dealId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDeal = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      setDeal(updatedDeal);
      return updatedDeal;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchDealById = useCallback(async (dealId) => {
    setLoading(true);
    setError(null);
    try {
      const allDeals = await authenticatedFetch(`${import.meta.env.VITE_API_URL}/api/deals`, { method: 'GET' });
      const specificDeal = allDeals.find(d => d.id.toString() === dealId);
      if (!specificDeal) throw new Error("Deal not found.");
      setDeal(specificDeal);
      return specificDeal;
    } catch (err) {
      setError(err.message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const value = { deal, loading, error, createDraftDeal, updateDeal, fetchDealById, setDeal };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};