// frontend/src/context/FMVContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FMVContext = createContext();

export const useFMVContext = () => useContext(FMVContext);

export const FMVProvider = ({ children }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState(() => {
    try {
      const savedData = localStorage.getItem('fmvFormData');
      return savedData ? JSON.parse(savedData) : {
        // --- Existing Fields ---
        gender: '',
        sport: '',
        division: '',
        university: '',
        conference: '',
        accolades: [],
        socialMedia: {
          instagram: { followers: '' },
          tiktok: { followers: '' },
          twitter: { followers: '' },
          youtube: { followers: '' },
        },
        brandName: '',
        industry: '',
        compensation: '',
        deliverables: [],
        
        // --- NEW WIZARD FIELDS [FP-REFACTOR-006] ---
        payor_name: '',
        payor_industry: '',
        deal_description: '',
        has_relationship: '', // 'yes' or 'no'
        payor_relationship_details: '',
        compensation_type: '',
        compensation_in_kind_description: '',
        has_written_contract: null,
        uses_school_ip: null,
        agent_name: '',
        agent_agency: '',
        contract_url: '',
      };
    } catch (error) {
      console.error("Could not parse fmvFormData from localStorage", error);
      return {}; // Return empty object on error
    }
  });

// ... (rest of the file remains the same)
  
  useEffect(() => {
    // Pre-fill from user profile if available
    if (user?.user_metadata) {
      setFormData(prevData => ({
        ...prevData,
        gender: prevData.gender || user.user_metadata.gender || '',
        sport: prevData.sport || user.user_metadata.sport || '',
        university: prevData.university || user.user_metadata.university || '',
        division: prevData.division || user.user_metadata.division || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fmvFormData', JSON.stringify(formData));
  }, [formData]);

  return (
    <FMVContext.Provider value={{ formData, setFormData }}>
      {children}
    </FMVContext.Provider>
  );
};