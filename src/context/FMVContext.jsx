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
  // Step 2
  gender: "",
  sport: [],
  graduation_year: "",
  age: "",
  gpa: "",
  achievements: [],
  prior_nil_deals: "",
  // Step 3
  social_platforms: [],
  followers_instagram: "",
  followers_tiktok: "",
  followers_twitter: "",
  followers_youtube: "",
  payment_structure: [],
  payment_structure_other: "",
  deal_length_months: "",
  proposed_dollar_amount: "",
  deal_category: [],
  brand_partner: "",
  deliverables: [],
  deliverables_count: {}, // Stores quantity for each deliverable
  deliverable_other: "",
  deal_type: [],
  is_real_submission: "",
  // Result
  fmv: null,
};

// Create the Provider component
export function FMVProvider({ children }) {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("fpn_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure sport is always an array for backward compatibility
        if (typeof parsed.sport === 'string') {
          parsed.sport = [parsed.sport];
        }
        // Initialize deliverables_count if not present
        if (!parsed.deliverables_count) {
          parsed.deliverables_count = {};
        }
        return { ...initialFormData, ...parsed };
      }
    } catch (error) {
      console.error("Failed to parse form data from localStorage", error);
    }
    return initialFormData;
  });

  const updateFormData = (newData) => {
    setFormData(prevData => {
      const nextData = { ...prevData, ...newData };
      localStorage.setItem("fpn_profile", JSON.stringify(nextData));
      return nextData;
    });
  };

  const resetFormData = () => {
    localStorage.removeItem("fpn_profile");
    setFormData(initialFormData);
  };

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