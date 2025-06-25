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

  const createDraftDeal = useCallback(async () => {
    if (!user) {
      setError("User must be logged in to create a deal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // *** BUG FIX: Add robust token validation ***
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) {
        throw new Error("Authentication error: Your session may have expired. Please log in again.");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create draft deal.');
      }

      const newDraft = await response.json();
      setDeal(newDraft);
      
      navigate(`/add/deal/terms/${newDraft.id}`);
      return newDraft;

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const updateDeal = useCallback(async (dealId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      // *** BUG FIX: Add robust token validation ***
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) {
        throw new Error("Authentication error: Your session may have expired. Please log in again.");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update deal.');
      }

      const updatedDeal = await response.json();
      setDeal(updatedDeal);
      return updatedDeal;

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchDealById = useCallback(async (dealId) => {
      setLoading(true);
      setError(null);
      try {
          // *** BUG FIX: Add robust token validation ***
          const sessionRes = await supabase.auth.getSession();
          const token = sessionRes.data.session?.access_token;
          if (!token) {
              throw new Error("Authentication error: Your session may have expired. Please log in again.");
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
               headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Failed to fetch deals.");
          
          const allDeals = await response.json();
          const specificDeal = allDeals.find(d => d.id.toString() === dealId);

          if (!specificDeal) throw new Error("Deal not found.");

          setDeal(specificDeal);
          return specificDeal;
      } catch(err) {
          setError(err.message);
          console.error(err);
          navigate('/dashboard');
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
    setDeal
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};