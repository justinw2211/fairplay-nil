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
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  const decodedActivityType = decodeURIComponent(activityType);
  const ActivityComponent = activityComponentMap[decodedActivityType];

  if (!ActivityComponent) {
    console.error(`No component found for activity type: ${decodedActivityType}`);
    return <Navigate to="/dashboard" replace />;
  }

  const selectedActivities = Object.keys(deal.obligations || {}).map(title => 
    Object.entries(activityTitleMap).find(([id, t]) => t === title)?.[0] || title
  );
  
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