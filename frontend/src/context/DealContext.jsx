// frontend/src/context/DealContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

// Create the context
const DealContext = createContext();

// Create the Provider component
export const DealProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to create a new draft deal
  const createDraftDeal = useCallback(async () => {
    if (!user) {
      setError("User must be logged in to create a deal.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
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
      
      // Navigate to the first step of the new wizard
      navigate(`/add/deal/terms/${newDraft.id}`);
      return newDraft;

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Function to update the deal (our auto-save mechanism)
  const updateDeal = useCallback(async (dealId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
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
      setDeal(updatedDeal); // Update local state with the saved data
      return updatedDeal;

    } catch (err) {
      setError(err.message);
      console.error(err);
      // We don't want to stop the user, so we just log the error
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Function to fetch a specific deal, e.g., when resuming a draft
  const fetchDealById = useCallback(async (dealId) => {
      setLoading(true);
      setError(null);
      try {
          const token = (await supabase.auth.getSession()).data.session?.access_token;
          // In a real app, you might have a GET /api/deals/{id} endpoint.
          // For now, we fetch all and find the one we need. This is less efficient but works with our current backend.
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
          // If a deal can't be fetched, redirect to the dashboard to avoid a broken page
          navigate('/dashboard');
      } finally {
          setLoading(false);
      }
  }, [navigate]);

  // The value provided to consuming components
  const value = {
    deal,
    loading,
    error,
    createDraftDeal,
    updateDeal,
    fetchDealById,
    setDeal // also expose setDeal for manual state updates if needed
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};

// Custom hook to use the DealContext
export const useDeal = () => {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};