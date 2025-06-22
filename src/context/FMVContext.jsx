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

  const updateFormData = (newData) => {
    setFormData(prevData => {
      const nextData = { ...prevData, ...newData };
      // Save only the calculator data, not the entire user profile structure
      const { id, created_at, updated_at, role, ...calculatorData } = nextData;
      localStorage.setItem("fpn_profile", JSON.stringify(calculatorData));
      return nextData;
    });
  };

  const resetFormData = useCallback(() => {
    localStorage.removeItem("fpn_profile");
    setFormData(initialFormData);
  }, []);
  
  const initializeNewCalculation = useCallback(async () => {
    resetFormData();

    if (user) {
      // Fetch the user's profile safely, allowing for it to not exist yet.
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() to prevent errors for new users.

      if (error) {
        console.error("Error fetching profile for pre-fill:", error.message);
      }
      
      // Pre-fill the form with profile data if it exists, otherwise use auth metadata as a fallback.
      // This ensures a consistent experience and maximum data pre-population.
      const prefillData = {
        name: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        division: profile?.division || "",
        school: profile?.school || "",
        gender: profile?.gender || "",
        sport: profile?.sports || [], // The form expects `sport`, the DB has `sports`
        graduation_year: profile?.graduation_year || "",
      };

      updateFormData(prefillData);
    }
  }, [user, resetFormData, updateFormData]);

  const value = useMemo(() => ({
    formData,
    updateFormData,
    resetFormData,
    initializeNewCalculation,
  }), [formData, resetFormData, initializeNewCalculation, updateFormData]);

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