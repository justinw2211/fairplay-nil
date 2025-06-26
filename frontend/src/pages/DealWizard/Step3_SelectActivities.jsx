// frontend/src/pages/DealWizard/Step3_SelectActivities.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { Box, SimpleGrid, useToast } from '@chakra-ui/react';

const ActivityCard = ({ title, isSelected, onSelect }) => {
  return (
    <Box
      p={6}
      borderWidth="2px"
      borderRadius="lg"
      borderColor={isSelected ? 'brand.accentPrimary' : 'gray.200'}
      bg={isSelected ? '#fdf9f7' : 'white'}
      cursor="pointer"
      textAlign="center"
      fontWeight="bold"
      onClick={() => onSelect(title)}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-3px)', shadow: 'md' }}
    >
      {title}
    </Box>
  );
};

const availableActivities = [
  "Social Media", "Appearance", "Content for Brand", "Autographs", "Merch and Products", "Endorsements", "Other",
];

const Step3_SelectActivities = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();
  const toast = useToast();
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    if (deal?.obligations) {
      setSelectedActivities(Object.keys(deal.obligations));
    }
  }, [deal]);

  const handleSelect = (activityTitle) => {
    setSelectedActivities(prev => 
      prev.includes(activityTitle)
        ? prev.filter(item => item !== activityTitle)
        : [...prev, activityTitle]
    );
  };
  
  const onContinue = async () => {
    if (selectedActivities.length === 0) {
      toast({
        title: "No activities selected",
        description: "Please select at least one activity.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    const newObligations = { ...deal.obligations };
    availableActivities.forEach(activity => {
        if (selectedActivities.includes(activity)) {
            if (!newObligations[activity]) {
                 newObligations[activity] = activity === "Social Media" ? [] : {};
            }
        } else {
            delete newObligations[activity];
        }
    });

    await updateDeal(dealId, { obligations: newObligations });

    const firstActivity = selectedActivities[0];
    const encodedActivity = encodeURIComponent(firstActivity);
    navigate(`/add/deal/activity/${encodedActivity}/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="What activities or deliverables are you being paid for?"
      instructions="Select all that apply. You will provide details for each in the next steps."
      onContinue={onContinue}
      isContinueDisabled={selectedActivities.length === 0}
    >
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {availableActivities.map(activity => (
          <ActivityCard
            key={activity}
            title={activity}
            isSelected={selectedActivities.includes(activity)}
            onSelect={handleSelect}
          />
        ))}
      </SimpleGrid>
    </DealWizardLayout>
  );
};

// *** BUG FIX: Add the missing default export statement. ***
export default Step3_SelectActivities;