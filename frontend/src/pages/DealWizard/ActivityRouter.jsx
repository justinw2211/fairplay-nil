// frontend/src/pages/DealWizard/ActivityRouter.jsx
import React from 'react';
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
  const { deal, loading } = useDeal();

  if (loading || !deal) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const sanitizedActivityType = activityType.replace(/%20/g, ' ').replace(/%26/g, '&');
  const ActivityComponent = activityComponentMap[sanitizedActivityType];

  if (!ActivityComponent) {
    console.error(`No component found for activity type: ${sanitizedActivityType}`);
    return <Navigate to={`/dashboard`} replace />;
  }

  const selectedActivities = Object.keys(deal.obligations || {});
  const currentIndex = selectedActivities.indexOf(sanitizedActivityType);

  let nextStepUrl = '';
  if (currentIndex < selectedActivities.length - 1) {
    const nextActivity = selectedActivities[currentIndex + 1];
    nextStepUrl = `/add/deal/activity/${encodeURIComponent(nextActivity)}/${dealId}`;
  } else {
    // *** This line correctly navigates to the new compliance step ***
    nextStepUrl = `/add/deal/compliance/${dealId}`;
  }
  
  return <ActivityComponent nextStepUrl={nextStepUrl} />;
};

export default ActivityRouter;