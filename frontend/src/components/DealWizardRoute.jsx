import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
import { useAuth } from '../context/AuthContext';

const DealWizardRoute = ({ children }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal } = useDeal();
  const { user } = useAuth();

  useEffect(() => {
    const validateDealId = async () => {
      if (!dealId) {
        navigate('/dashboard');
        return;
      }

      // If we can't load the deal or it doesn't exist
      if (!deal && dealId) {
        navigate('/dashboard');
      }
    };

    validateDealId();
  }, [dealId, deal, navigate]);

  // First check authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Then check deal data
  return deal ? children : null;
};

export default DealWizardRoute; 