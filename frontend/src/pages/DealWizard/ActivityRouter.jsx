// frontend/src/pages/DealWizard/ActivityRouter.jsx
import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
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

  const handleNext = async () => {
    // Get the current obligations
    const updatedObligations = { ...deal.obligations };
    
    // Mark the current activity as completed
    if (updatedObligations[decodedActivityType]) {
      updatedObligations[decodedActivityType].completed = true;
    }

    // Update the deal with completed activity and next index
    await updateDeal(dealId, {
      obligations: updatedObligations,
      currentActivityIndex: currentIndex + 1,
      lastCompletedActivity: decodedActivityType
    });

    // Check if all activities are completed before moving to compliance
    const allActivitiesCompleted = Object.values(updatedObligations)
      .every(activity => activity.completed);

    // If this was the last activity and all are completed, go to compliance
    if (currentIndex === selectedActivities.length - 1 && allActivitiesCompleted) {
      navigate(`/add/deal/compliance/${dealId}`);
    } else if (currentIndex < selectedActivities.length - 1) {
      // Move to next activity
      const nextActivity = selectedActivities[currentIndex + 1];
      const encodedNextActivity = encodeURIComponent(nextActivity);
      navigate(`/add/deal/activity/${encodedNextActivity}/${dealId}`);
    } else {
      // If we're at the last activity but some aren't completed,
      // find the first incomplete activity
      const firstIncompleteActivity = selectedActivities.find(
        activity => !updatedObligations[activity].completed
      );
      if (firstIncompleteActivity) {
        const encodedActivity = encodeURIComponent(firstIncompleteActivity);
        navigate(`/add/deal/activity/${encodedActivity}/${dealId}`);
      }
    }
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