import { useEffect, useState } from 'react';
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

  console.log('[DealWizardRoute] Component rendered with dealId:', dealId);
  console.log('[DealWizardRoute] User:', user ? 'authenticated' : 'not authenticated');
  console.log('[DealWizardRoute] Deal:', deal);
  console.log('[DealWizardRoute] isLoading:', isLoading);

  useEffect(() => {
    const validateDealId = async () => {
      console.log('[DealWizardRoute] validateDealId called');

      if (!dealId) {
        console.log('[DealWizardRoute] No dealId, navigating to dashboard');
        navigate('/dashboard');
        return;
      }

      try {
        console.log('[DealWizardRoute] Fetching deal by ID:', dealId);
        await fetchDealById(dealId);
        console.log('[DealWizardRoute] Deal fetched successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('[DealWizardRoute] Error fetching deal:', error);
        // Log error without sensitive data
        navigate('/dashboard');
      }
    };

    validateDealId();
  }, [dealId, fetchDealById, navigate]);

  // First check authentication
  if (!user) {
    console.log('[DealWizardRoute] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Show loading state while fetching deal
  if (isLoading) {
    console.log('[DealWizardRoute] Showing loading spinner');
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Then check deal data
  console.log('[DealWizardRoute] Rendering children, deal exists:', !!deal);
  return deal ? children : null;
};

export default DealWizardRoute;