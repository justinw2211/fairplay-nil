// frontend/src/pages/DealWizard/ActivityRouter.jsx
import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { Spinner, Flex } from '@chakra-ui/react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import * as Sentry from '@sentry/react';

// Import all the possible activity form components
import ActivityForm_SocialMedia from './ActivityForm_SocialMedia';
import ActivityForm_Appearance from './ActivityForm_Appearance';
import ActivityForm_Content from './ActivityForm_Content';
import ActivityForm_Autographs from './ActivityForm_Autographs';
import ActivityForm_Merch from './ActivityForm_Merch';
import ActivityForm_Endorsements from './ActivityForm_Endorsements';
import ActivityForm_Other from './ActivityForm_Other';

const activityComponentMap = {
  "social-media": ActivityForm_SocialMedia,
  "appearance": ActivityForm_Appearance,
  "content-for-brand": ActivityForm_Content,
  "autographs": ActivityForm_Autographs,
  "merch-and-products": ActivityForm_Merch,
  "endorsements": ActivityForm_Endorsements,
  "other": ActivityForm_Other,
};

const ActivityRouter = () => {
  const { dealId, activityType } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, loading, fetchDealById, updateDeal } = useDeal();

  // Store the activity sequence in component state for stability
  const [activitySequence, setActivitySequence] = useState([]);

  console.log('🎯 ActivityRouter Debug Info:');
  console.log('dealId:', dealId);
  console.log('activityType:', activityType);
  console.log('currentDeal:', currentDeal);
  console.log('loading:', loading);
  console.log('activitySequence:', activitySequence);
  console.log('currentDeal?.obligations:', currentDeal?.obligations);
  console.log('currentDeal?.id:', currentDeal?.id);
  console.log('dealId as number:', parseInt(dealId));

  // Track component initialization
  Sentry.captureMessage('ActivityRouter: Component initialized', 'info', {
    tags: {
      component: 'ActivityRouter',
      action: 'component_init',
      dealId
    },
    extra: {
      dealId,
      activityType,
      loading,
      hasDeal: !!currentDeal,
      activitySequenceLength: activitySequence.length
    }
  });

  useEffect(() => {
    // Only fetch if we don't have a deal or if the deal ID doesn't match
    if (!currentDeal || currentDeal.id !== parseInt(dealId)) {
      console.log('🔄 Fetching deal by ID:', dealId);

      // Track deal fetching attempt
      Sentry.captureMessage('ActivityRouter: Fetching deal', 'info', {
        tags: {
          component: 'ActivityRouter',
          action: 'fetch_deal',
          dealId
        },
        extra: {
          dealId,
          activityType,
          hasCurrentDeal: !!currentDeal,
          currentDealId: currentDeal?.id
        }
      });

      fetchDealById(dealId);
    }
  }, [currentDeal, dealId, fetchDealById]);

  // Initialize activity sequence when deal loads
  useEffect(() => {
    console.log('🔄 Checking deal obligations for sequence initialization');
    console.log('currentDeal?.obligations:', currentDeal?.obligations);
    console.log('activitySequence.length:', activitySequence.length);

    // Track sequence initialization attempt
    Sentry.captureMessage('ActivityRouter: Checking sequence initialization', 'info', {
      tags: {
        component: 'ActivityRouter',
        action: 'sequence_check',
        dealId
      },
      extra: {
        dealId,
        hasObligations: !!currentDeal?.obligations,
        obligationsKeys: currentDeal?.obligations ? Object.keys(currentDeal.obligations) : [],
        activitySequenceLength: activitySequence.length
      }
    });

    if (currentDeal?.obligations && activitySequence.length === 0) {
      // Get the original activity sequence from obligations
      const sequence = Object.entries(currentDeal.obligations)
        .filter(([_, value]) => typeof value === 'object' && value !== null && 'sequence' in value)
        .sort((a, b) => a[1].sequence - b[1].sequence)
        .map(([activity]) => activity);

      console.log('🔄 Initializing activity sequence:', sequence);
      setActivitySequence(sequence);

      // Track successful activity sequence initialization in Sentry
      Sentry.captureMessage('Activity sequence initialized successfully', 'info', {
        tags: {
          component: 'ActivityRouter',
          action: 'initialize_sequence',
          dealId
        },
        extra: {
          dealId,
          sequenceLength: sequence.length,
          activities: sequence,
          obligations: currentDeal.obligations
        }
      });
    }
  }, [currentDeal, activitySequence.length, dealId]);

  if (loading || !currentDeal) {
    console.log('⏳ Showing loading spinner - loading:', loading, 'currentDeal:', !!currentDeal);

    // Track loading state
    Sentry.captureMessage('ActivityRouter: Showing loading spinner', 'info', {
      tags: {
        component: 'ActivityRouter',
        action: 'loading_state',
        dealId
      },
      extra: {
        dealId,
        loading,
        hasDeal: !!currentDeal,
        activityType
      }
    });

    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const decodedActivityType = decodeURIComponent(activityType);
  // Check if we have a valid activity component
  const ActivityComponent = activityComponentMap[decodedActivityType];
  
  // Track component resolution attempt
  Sentry.captureMessage('ActivityRouter: Component resolution attempt', 'info', {
    tags: {
      component: 'ActivityRouter',
      action: 'component_resolution',
      dealId
    },
    extra: {
      dealId,
      dealType,
      decodedActivityType,
      hasComponent: !!ActivityComponent,
      availableComponents: Object.keys(activityComponentMap),
      step: 'ActivityRouter',
      operation: 'component_resolution'
    }
  });
  
  if (!ActivityComponent) {
    console.error('❌ No component found for activity type:', decodedActivityType);
    console.error('Available components:', Object.keys(activityComponentMap));
    
    // Track component not found error
    Sentry.captureMessage('ActivityRouter: No component found', 'error', {
      tags: {
        component: 'ActivityRouter',
        action: 'component_not_found',
        dealId
      },
      extra: {
        dealId,
        dealType,
        decodedActivityType,
        availableComponents: Object.keys(activityComponentMap),
        step: 'ActivityRouter',
        operation: 'component_resolution'
      }
    });
    
    // Redirect to activities selection instead of dashboard
    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    const redirectUrl = `/add/deal/activities/select/${dealId}${typeParam}`;
    Sentry.captureMessage('ActivityRouter: Redirecting to activities selection', 'warning', {
      tags: {
        component: 'ActivityRouter',
        action: 'redirect_to_activities',
        dealId
      },
      extra: {
        dealId,
        dealType,
        decodedActivityType,
        redirectUrl,
        currentUrl: window.location.href,
        availableComponents: Object.keys(activityComponentMap),
        step: 'ActivityRouter',
        operation: 'component_not_found_redirect'
      }
    });
    
    navigate(redirectUrl);
  }

  // Calculate current activity index directly from the URL and sequence
  const currentActivityIndex = activitySequence.length > 0 ? activitySequence.indexOf(decodedActivityType) : -1;
  const totalActivities = activitySequence.length;
  const currentActivityNumber = currentActivityIndex >= 0 ? currentActivityIndex + 1 : 1;

  console.log('🎯 ActivityRouter State (Direct Calculation):');
  console.log('activitySequence:', activitySequence);
  console.log('decodedActivityType:', decodedActivityType);
  console.log('currentActivityIndex:', currentActivityIndex);
  console.log('totalActivities:', totalActivities);
  console.log('currentActivity:', decodedActivityType);

  // Track state calculation
  Sentry.captureMessage('ActivityRouter: State calculation', 'info', {
    tags: {
      component: 'ActivityRouter',
      action: 'state_calculation',
      dealId
    },
    extra: {
      dealId,
      activitySequence,
      decodedActivityType,
      currentActivityIndex,
      totalActivities,
      currentActivityNumber
    }
  });

  // Early return if we don't have a valid activity index
  if (currentActivityIndex < 0 && activitySequence.length > 0) {
    console.error('❌ Activity not found in sequence:', decodedActivityType);
    console.error('Available activities:', activitySequence);

    // Track activity not found error
    Sentry.captureMessage('ActivityRouter: Activity not found in sequence', 'error', {
      tags: {
        component: 'ActivityRouter',
        action: 'activity_not_found',
        dealId
      },
      extra: {
        dealId,
        decodedActivityType,
        activitySequence,
        currentActivityIndex
      }
    });

    return <Navigate to="/dashboard" replace />;
  }

  const handleNext = async () => {
    console.log('🚀 handleNext called with stable sequence');
    console.log('Current index:', currentActivityIndex);
    console.log('Total activities:', totalActivities);
    console.log('Is last activity?', currentActivityIndex >= totalActivities - 1);

    // Mark the current activity as completed in obligations
    const updatedObligations = { ...currentDeal.obligations };
    if (updatedObligations[decodedActivityType]) {
      updatedObligations[decodedActivityType].completed = true;
      console.log(`✅ Marked ${decodedActivityType} as completed`);
    }

    // Update the deal with completion status
    await updateDeal(dealId, {
      obligations: updatedObligations,
      lastCompletedActivity: decodedActivityType,
      currentActivityIndex: currentActivityIndex + 1
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';

    // Check if this is the last activity
    if (currentActivityIndex >= totalActivities - 1) {
      console.log('🏁 Going to compliance (last activity)');
      navigate(`/add/deal/compliance/${dealId}${typeParam}`);
      return;
    }

    // Move to next activity
    const nextIndex = currentActivityIndex + 1;
    const nextActivity = activitySequence[nextIndex];
    const encodedNextActivity = encodeURIComponent(nextActivity);

    console.log('➡️ Moving to next activity:', nextActivity);
    console.log('Next index:', nextIndex);
    console.log('Full next URL:', `/add/deal/activity/${encodedNextActivity}/${dealId}${typeParam}`);

    navigate(`/add/deal/activity/${encodedNextActivity}/${dealId}${typeParam}`);
  };

  return (
    <DealWizardStepWrapper stepNumber={4} stepName="Activity Forms">
      <ActivityComponent
        onNext={handleNext}
        currentActivity={currentActivityNumber}
        totalActivities={totalActivities}
      />
    </DealWizardStepWrapper>
  );
};

export default ActivityRouter;