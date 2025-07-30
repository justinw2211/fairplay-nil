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
  const { deal, loading, fetchDealById, updateDeal } = useDeal();

  // Store the activity sequence in component state for stability
  const [activitySequence, setActivitySequence] = useState([]);

  console.log('🎯 ActivityRouter Debug Info:');
  console.log('dealId:', dealId);
  console.log('activityType:', activityType);
  console.log('deal:', deal);
  console.log('loading:', loading);
  console.log('activitySequence:', activitySequence);

  useEffect(() => {
    if (!deal && dealId) {
      console.log('🔄 Fetching deal by ID:', dealId);
      fetchDealById(dealId);
    }
  }, [deal, dealId, fetchDealById]);

  // Initialize activity sequence when deal loads
  useEffect(() => {
    console.log('🔄 Checking deal obligations for sequence initialization');
    console.log('deal?.obligations:', deal?.obligations);
    console.log('activitySequence.length:', activitySequence.length);

    if (deal?.obligations && activitySequence.length === 0) {
      // Get the original activity sequence from obligations
      const sequence = Object.entries(deal.obligations)
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
          activities: sequence
        }
      });
    }
  }, [deal, activitySequence.length, dealId]);

  if (loading || !deal) {
    console.log('⏳ Showing loading spinner - loading:', loading, 'deal:', !!deal);
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const decodedActivityType = decodeURIComponent(activityType);
  const ActivityComponent = activityComponentMap[decodedActivityType];

  console.log('🎯 Component resolution:');
  console.log('decodedActivityType:', decodedActivityType);
  console.log('ActivityComponent:', ActivityComponent);

  if (!ActivityComponent) {
    console.error(`❌ No component found for activity type: ${decodedActivityType}`);
    return <Navigate to="/dashboard" replace />;
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

  // Early return if we don't have a valid activity index
  if (currentActivityIndex < 0 && activitySequence.length > 0) {
    console.error('❌ Activity not found in sequence:', decodedActivityType);
    console.error('Available activities:', activitySequence);
    return <Navigate to="/dashboard" replace />;
  }

  const handleNext = async () => {
    console.log('🚀 handleNext called with stable sequence');
    console.log('Current index:', currentActivityIndex);
    console.log('Total activities:', totalActivities);
    console.log('Is last activity?', currentActivityIndex >= totalActivities - 1);

    // Mark the current activity as completed in obligations
    const updatedObligations = { ...deal.obligations };
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