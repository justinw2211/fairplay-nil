import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useDeal } from '../context/DealContext';
import { useAuth } from '../context/AuthContext';
import { Spinner, Flex } from '@chakra-ui/react';
// Temporarily disabled Sentry to fix build issues
// import * as Sentry from '@sentry/react';

const DealWizardRoute = ({ children }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { currentDeal, fetchDealById } = useDeal();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  console.log('[DealWizardRoute] Component rendered with dealId:', dealId);
  console.log('[DealWizardRoute] User:', user ? 'authenticated' : 'not authenticated');
  console.log('[DealWizardRoute] currentDeal:', currentDeal);
  console.log('[DealWizardRoute] isLoading:', isLoading);

  useEffect(() => {
    const validateDealId = async () => {
      console.log('[DealWizardRoute] validateDealId called');

      // Start Sentry transaction for deal validation
      // const transaction = Sentry.startTransaction({
      //   name: `Deal Validation - ${dealId}`,
      //   op: 'deal.validation'
      // });

      // Sentry.setContext('deal_validation', {
      //   dealId,
      //   userId: user?.id,
      //   timestamp: new Date().toISOString()
      // });

      if (!dealId) {
        console.log('[DealWizardRoute] No dealId, navigating to dashboard');
        // Sentry.captureMessage('No dealId provided, redirecting to dashboard', 'warning');
        navigate('/dashboard');
        // transaction.setStatus('invalid_argument');
        // transaction.finish();
        return;
      }

      try {
        console.log('[DealWizardRoute] Fetching deal by ID:', dealId);
        await fetchDealById(dealId);
        console.log('[DealWizardRoute] Deal fetched successfully');
        setIsLoading(false);
        // transaction.setStatus('ok');
      } catch (error) {
        console.error('[DealWizardRoute] Error fetching deal:', error);

        // Capture error in Sentry
        // Sentry.captureException(error, {
        //   tags: {
        //     component: 'DealWizardRoute',
        //     action: 'validateDealId',
        //     dealId
        //   },
        //   extra: {
        //     dealId,
        //     userId: user?.id,
        //     errorMessage: error.message
        //   }
        // });

        // transaction.setStatus('internal_error');
        // Log error without sensitive data
        navigate('/dashboard');
      } finally {
        // transaction.finish();
      }
    };

    validateDealId();
  }, [dealId, fetchDealById, navigate, user]);

  // First check authentication
  if (!user) {
    console.log('[DealWizardRoute] No user, redirecting to login');
    // Sentry.captureMessage('User not authenticated, redirecting to login', 'warning');
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
  console.log('[DealWizardRoute] Rendering children, deal exists:', !!currentDeal);

  if (!currentDeal) {
    // Sentry.captureMessage('Deal not found after successful fetch', 'error', {
    //   tags: {
    //     component: 'DealWizardRoute',
    //     action: 'render',
    //     dealId
    //   },
    //   extra: {
    //     dealId,
    //     userId: user?.id,
    //     isLoading
    //   }
    // });
  }

  return currentDeal ? children : null;
};

export default DealWizardRoute;