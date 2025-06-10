import React, { createContext, useState, useContext, useMemo } from 'react';

// This object is now exported so other parts of the app can use it,
// especially for resetting the form state.
export const initialFormData = {
  // Step 1
  division: '',
  school: '',
  name: '',
  email: '',
  gender: '',
  sport: '',
  graduation_year: '',
  age: '',
  gpa: '',
  prior_nil_deals: '',
  achievements: [],
  conference: '',
  athlete_status: '',
  geography: '',
  // Step 2
  followers_instagram: '',
  followers_tiktok: '',
  followers_twitter: '',
  followers_youtube: '',
  payment_structure: '',
  payment_structure_other: '',
  deal_length_months: '',
  proposed_dollar_amount: '',
  deal_category: '',
  brand_partner: '',
  deliverables: [],
  deliverable_other: '',
  deal_type: [],
  is_real_submission: '',
  // Placeholders
  deliverables_instagram: 0,
  deliverables_tiktok: 0,
  deliverables_twitter: 0,
  deliverables_youtube: 0,
  // Result
  fmv: null,
};

const FMVContext = createContext();

export function FMVProvider({ children }) {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('fpn_profile');
      if (saved) {
        return { ...initialFormData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to parse form data from localStorage', error);
    }
    return initialFormData;
  });

  const updateFormData = (newData) => {
    setFormData((prevData) => {
      const nextData = { ...prevData, ...newData };
      localStorage.setItem('fpn_profile', JSON.stringify(nextData));
      return nextData;
    });
  };

  const resetFormData = () => {
    localStorage.removeItem('fpn_profile');
    setFormData(initialFormData);
  };

  // The value now includes the initialFormData object for use in other components
  const value = useMemo(
    () => ({
      formData,
      updateFormData,
      resetFormData,
      initialFormData,
    }),
    [formData]
  );

  return (
    <FMVContext.Provider value={value}>{children}</FMVContext.Provider>
  );
}

export function useFMV() {
  const context = useContext(FMVContext);
  if (context === undefined) {
    throw new Error('useFMV must be used within a FMVProvider');
  }
  return context;
}
