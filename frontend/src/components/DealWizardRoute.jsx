import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
import { ProtectedRoute } from './ProtectedRoute';

const DealWizardRoute = ({ children }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal } = useDeal();

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

  // Wrap with ProtectedRoute to ensure user is authenticated
  return <ProtectedRoute>{deal ? children : null}</ProtectedRoute>;
};

export default DealWizardRoute; 