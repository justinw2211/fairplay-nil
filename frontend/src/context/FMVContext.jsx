// src/context/FMVContext.jsx
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { supabase } from '../supabaseClient.js';

const FMVContext = createContext();

const initialFormData = {
  division: "", school: "", name: "", email: "", gender: "", sport: [],
  graduation_year: "", age: "", gpa: "", achievements: [], prior_nil_deals: "",
  social_platforms: [], followers_instagram: "", followers_tiktok: "",
  followers_twitter: "", followers_youtube: "", payment_structure: [],
  payment_structure_other: "", deal_length_months: "", proposed_dollar_amount: "",
  deal_category: [], brand_partner: "", deliverables: [], deliverables_count: {},
  deliverable_other: "", deal_type: [], is_real_submission: "", fmv: null,
};

export function FMVProvider({ children }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("fpn_profile");
      return saved ? { ...initialFormData, ...JSON.parse(saved) } : initialFormData;
    } catch (error) {
      console.error("Failed to parse form data from localStorage", error);
      return initialFormData;
    }
  });

  // BEST PRACTICE: Wrap context functions in useCallback for stability
  const updateFormData = useCallback((newData) => {
    setFormData(prevData => {
      const nextData = { ...prevData, ...newData };
      localStorage.setItem("fpn_profile", JSON.stringify(nextData));
      return nextData;
    });
  }, []);

  const resetFormData = useCallback(() => {
    localStorage.removeItem("fpn_profile");
    setFormData(initialFormData);
  }, []);
  
  const initializeNewCalculation = useCallback(async () => {
    resetFormData();

    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile for pre-fill:", error.message);
      }
      
      const prefillData = {
        name: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        division: profile?.division || "",
        school: profile?.school || "",
        gender: profile?.gender || "",
        sport: profile?.sports || [],
        graduation_year: profile?.graduation_year || "",
      };

      updateFormData(prefillData);
    }
  }, [user, resetFormData, updateFormData]);

  // The value passed to the provider, now with stable functions
  const value = useMemo(() => ({
    formData,
    updateFormData,
    resetFormData,
    initializeNewCalculation,
  }), [formData, updateFormData, resetFormData, initializeNewCalculation]);

  return (
    <FMVContext.Provider value={value}>
      {children}
    </FMVContext.Provider>
  );
}

export function useFMV() {
  const context = useContext(FMVContext);
  if (context === undefined) {
    throw new Error('useFMV must be used within a FMVProvider');
  }
  return context;
}