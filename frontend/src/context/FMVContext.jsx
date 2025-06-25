// frontend/src/context/FMVContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const FMVContext = createContext();

export const useFMVContext = () => useContext(FMVContext);

// Define the complete initial state for a new deal
const getInitialState = () => ({
  payor_name: '',
  payor_industry: '',
  deal_description: '',
  has_relationship: '',
  payor_relationship_details: '',
  compensation_type: '',
  compensation_amount: '',
  compensation_in_kind_description: '',
  uses_school_ip: null,
  has_conflicts: null,
  has_written_contract: null,
  is_using_agent: null,
  agent_name: '',
  agent_agency: '',
  contract_url: '',
  // Include other legacy fields if needed to prevent errors
});


export const FMVProvider = ({ children }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(getInitialState());

  // Use a stable 'update' function instead of passing 'setFormData' directly
  const updateFormData = useCallback((newData) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  }, []);

  const resetAndPrefill = useCallback(async () => {
    let initialState = getInitialState();
    
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            initialState = {
                ...initialState,
                // Pre-fill any relevant user profile data here later if needed
            };
        }
    }
    setFormData(initialState);
  }, [user]);

  // Expose context value through useMemo for performance
  const value = useMemo(() => ({
    formData,
    updateFormData,
    resetAndPrefill,
  }), [formData, updateFormData, resetAndPrefill]);

  return (
    <FMVContext.Provider value={value}>
      {children}
    </FMVContext.Provider>
  );
};