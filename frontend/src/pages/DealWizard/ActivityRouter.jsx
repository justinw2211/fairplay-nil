// frontend/src/pages/DealWizard/ActivityRouter.jsx
import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { Spinner, Flex, Box, Text, Progress } from '@chakra-ui/react';

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

// Map to convert between kebab-case IDs and display titles
const activityTitleMap = {
  "social-media": "Social Media",
  "appearance": "Appearance",
  "content-for-brand": "Content for Brand",
  "autographs": "Autographs",
  "merch-and-products": "Merch and Products",
  "endorsements": "Endorsements",
  "other": "Other",
};

const ActivityRouter = () => {
  const { dealId, activityType } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { deal, loading, fetchDealById, updateDeal } = useDeal();

  // This effect hook makes the component more robust.
  // If it loads and doesn't have the deal data, it fetches it.
  useEffect(() => {
    if (!deal && dealId) {
      fetchDealById(dealId);
    }
  }, [deal, dealId, fetchDealById]);

  // While loading, show a spinner. This now correctly waits for the fetch to complete.
  if (loading || !deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const decodedActivityType = decodeURIComponent(activityType);
  
  // DEBUG: Log the deal structure and activity info
  console.log('🔍 ActivityRouter Debug Info:');
  console.log('dealId:', dealId);
  console.log('activityType (encoded):', activityType);
  console.log('decodedActivityType:', decodedActivityType);
  console.log('dealType:', dealType);
  console.log('deal.obligations:', deal.obligations);
  
  const ActivityComponent = activityComponentMap[decodedActivityType];

  if (!ActivityComponent) {
    console.error(`No component found for activity type: ${decodedActivityType}`);
    return <Navigate to="/dashboard" replace />;
  }

  // Get sorted activities based on sequence
  const selectedActivities = Object.entries(deal.obligations || {})
    .sort((a, b) => a[1].sequence - b[1].sequence)
    .map(([activity]) => activity);

  const currentIndex = selectedActivities.indexOf(decodedActivityType);
  const currentActivityNumber = currentIndex + 1;
  const totalActivities = selectedActivities.length;
  const progressPercentage = (currentActivityNumber / totalActivities) * 100;

  // DEBUG: Log the activity processing info
  console.log('selectedActivities:', selectedActivities);
  console.log('currentIndex:', currentIndex);
  console.log('currentActivityNumber:', currentActivityNumber);
  console.log('totalActivities:', totalActivities);
  console.log('progressPercentage:', progressPercentage);

  const handleNext = async () => {
    console.log('🚀 handleNext called');
    
    // Get the current obligations
    const updatedObligations = { ...deal.obligations };
    
    // Mark the current activity as completed
    if (updatedObligations[decodedActivityType]) {
      updatedObligations[decodedActivityType].completed = true;
      console.log(`✅ Marked ${decodedActivityType} as completed`);
    }

    // Calculate the next activity index
    const nextIndex = currentIndex + 1;
    console.log('nextIndex:', nextIndex);
    console.log('selectedActivities.length:', selectedActivities.length);
    console.log('Is this the last activity?', currentIndex === selectedActivities.length - 1);

    // Update the deal with completed activity and next index
    await updateDeal(dealId, {
      obligations: updatedObligations,
      currentActivityIndex: nextIndex,
      lastCompletedActivity: decodedActivityType
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';

    // If this was the last activity, go to compliance
    if (currentIndex === selectedActivities.length - 1) {
      console.log('🏁 Going to compliance (last activity)');
      navigate(`/add/deal/compliance/${dealId}${typeParam}`);
      return;
    }

    // Otherwise, move to the next activity
    const nextActivity = selectedActivities[nextIndex];
    const encodedNextActivity = encodeURIComponent(nextActivity);
    console.log('➡️ Moving to next activity:', nextActivity);
    console.log('encodedNextActivity:', encodedNextActivity);
    console.log('Full next URL:', `/add/deal/activity/${encodedNextActivity}/${dealId}${typeParam}`);
    
    navigate(`/add/deal/activity/${encodedNextActivity}/${dealId}${typeParam}`);
  };

  return (
    <>
      <ActivityComponent 
        onNext={handleNext}
        currentActivity={currentActivityNumber}
        totalActivities={totalActivities}
      />
    </>
  );
};

export default ActivityRouter;