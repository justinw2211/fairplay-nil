import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
import { useAuth } from '../context/AuthContext';
import { Spinner, Flex } from '@chakra-ui/react';

const DealWizardRoute = ({ children }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, fetchDealById } = useDeal();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateDealId = async () => {
      if (!dealId) {
        navigate('/dashboard');
        return;
      }

      try {
        await fetchDealById(dealId);
        setIsLoading(false);
      } catch (error) {
        // Log error without sensitive data
        navigate('/dashboard');
      }
    };

    validateDealId();
  }, [dealId, fetchDealById, navigate]);

  // First check authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while fetching deal
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Then check deal data
  return deal ? children : null;
};

export default DealWizardRoute; 