// frontend/src/pages/DealWizard/ActivityRouter.jsx
import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
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
  const { deal, loading } = useDeal();
  const navigate = useNavigate();

  // Show loading spinner ONLY if the deal object isn't available yet.
  // This prevents getting stuck on a loading screen after an update.
  if (loading && !deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // If there's no deal data at all, we can't proceed.
  if (!deal) {
      // You can add logic here to fetch the deal or redirect.
      // For now, redirecting to the dashboard is safest.
      return <Navigate to="/dashboard" replace />;
  }

  // *** BUG FIX: Use decodeURIComponent to correctly handle spaces from the URL. ***
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