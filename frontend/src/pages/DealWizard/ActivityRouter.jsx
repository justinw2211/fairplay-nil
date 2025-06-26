// frontend/src/pages/DealWizard/ActivityRouter.jsx
import React, { useEffect } from 'react'; // Import useEffect
import { useParams, Navigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { Spinner, Flex } from '@chakra-ui/react';

// Import all the possible activity form components
import ActivityForm_SocialMedia from './ActivityForm_SocialMedia';
import ActivityForm_Appearance from './ActivityForm_Appearance';
import ActivityForm_Content from './ActivityForm_Content';
import ActivityForm_Autographs from './ActivityForm_Autographs';
import ActivityForm_Merch from './ActivityForm_Merch';
import ActivityForm_Endorsements from './ActivityForm_Endorsements';
import ActivityForm_Other from './ActivityForm_Other';

const activityComponentMap = {
  "Social Media": ActivityForm_SocialMedia,
  "Appearance": ActivityForm_Appearance,
  "Content for Brand": ActivityForm_Content,
  "Autographs": ActivityForm_Autographs,
  "Merch and Products": ActivityForm_Merch,
  "Endorsements": ActivityForm_Endorsements,
  "Other": ActivityForm_Other,
};

const ActivityRouter = () => {
  const { dealId, activityType } = useParams();
  // *** BUG FIX: fetchDealById is now imported to handle the race condition ***
  const { deal, loading, fetchDealById } = useDeal();

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
        <Spinner size="xl" />
      </Flex>
    );
  }

  const decodedActivityType = decodeURIComponent(activityType);
  const ActivityComponent = activityComponentMap[decodedActivityType];

  if (!ActivityComponent) {
    console.error(`No component found for activity type: ${decodedActivityType}`);
    return <Navigate to={`/dashboard`} replace />;
  }

  const selectedActivities = Object.keys(deal.obligations || {});
  const currentIndex = selectedActivities.indexOf(decodedActivityType);

  let nextStepUrl = '';
  if (currentIndex < selectedActivities.length - 1) {
    const nextActivity = selectedActivities[currentIndex + 1];
    const encodedNextActivity = encodeURIComponent(nextActivity);
    nextStepUrl = `/add/deal/activity/${encodedNextActivity}/${dealId}`;
  } else {
    nextStepUrl = `/add/deal/compliance/${dealId}`;
  }
  
  return <ActivityComponent nextStepUrl={nextStepUrl} />;
};

export default ActivityRouter;