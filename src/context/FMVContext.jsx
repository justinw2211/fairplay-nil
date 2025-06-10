import React, { createContext, useState, useContext, useMemo } from 'react';

// Create the context
const FMVContext = createContext();

// Initial state for the form
const initialFormData = {
  // Step 1
  division: "",
  school: "",
  name: "",
  email: "",
  gender: "",
  sport: "",
  graduation_year: "",
  age: "",
  gpa: "",
  prior_nil_deals: "",
  // Step 2
  payment_structure: "",
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deal_category: "",
  brand_partner: "",
  deliverables: [],
  deliverables_count: {},
  deliverable_other: "",

  deal_type: [],
  is_real_submission: "",
  // Result
  fmv: null,
};


// Create the Provider component
export function FMVProvider({ children }) {
  const [formData, setFormData] = useState(() => {
    // Try to recover saved profile from localStorage on refresh/resume
    try {
      const saved = localStorage.getItem("fpn_profile");
      if (saved) {
        // Merge saved data with initial data to ensure all keys are present
        return { ...initialFormData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Failed to parse form data from localStorage", error);
    }
    return initialFormData;
  });

  // Function to update form data and persist to localStorage
  const updateFormData = (newData) => {
    setFormData(prevData => {
      const nextData = { ...prevData, ...newData };
      localStorage.setItem("fpn_profile", JSON.stringify(nextData));
      return nextData;
    });
  };

  // Function to reset form data
  const resetFormData = () => {
    localStorage.removeItem("fpn_profile");
    setFormData(initialFormData);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    formData,
    updateFormData,
    resetFormData,
  }), [formData]);

  return (
    <FMVContext.Provider value={value}>
      {children}
    </FMVContext.Provider>
  );
}

// Custom hook to easily consume the context
export function useFMV() {
  const context = useContext(FMVContext);
  if (context === undefined) {
    throw new Error('useFMV must be used within a FMVProvider');
  }
  return context;
}
