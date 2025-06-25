// frontend/src/context/FMVContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient'; // Import supabase client

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
  // Profile fields that can be pre-filled
  gender: '',
  sport: '',
  division: '',
  university: '',
});


export const FMVProvider = ({ children }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(getInitialState());

  const updateFormData = useCallback((newData) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  }, []);

  // This function now robustly resets and pre-fills the form with the LATEST profile data
  const resetAndPrefill = useCallback(async () => {
    let initialState = getInitialState();
    
    // If a user is logged in, fetch their LATEST profile from the database
    if (user) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('gender, sport, division, university') // Select only needed fields
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
            console.error("Error fetching profile for pre-fill:", error);
        }

        if (profile) {
            initialState = {
                ...initialState,
                gender: profile.gender || '',
                sport: profile.sport || '',
                division: profile.division || '',
                university: profile.university || '',
            };
        }
    }
    setFormData(initialState);
  }, [user]);

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