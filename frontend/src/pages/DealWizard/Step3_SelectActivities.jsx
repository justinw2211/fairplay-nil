// frontend/src/pages/DealWizard/Step3_SelectActivities.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { Box, SimpleGrid, useToast } from '@chakra-ui/react';

// This is a reusable component for the selectable cards.
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

// Define the available activities as per the blueprint.
const availableActivities = [
  "Social Media",
  "Appearance",
  "Content for Brand",
  "Autographs",
  "Merch and Products",
  "Endorsements",
  "Other",
];

const Step3_SelectActivities = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();
  const toast = useToast();

  // State to manage which activities are currently selected.
  const [selectedActivities, setSelectedActivities] = useState([]);

  // When the deal data loads, initialize the selected activities from the 'obligations' field.
  useEffect(() => {
    if (deal?.obligations) {
      setSelectedActivities(Object.keys(deal.obligations));
    }
  }, [deal]);

  const handleSelect = (activityTitle) => {
    setSelectedActivities(prev => 
      prev.includes(activityTitle)
        ? prev.filter(item => item !== activityTitle) // Deselect if already selected
        : [...prev, activityTitle] // Select if not already selected
    );
  };
  
  const onContinue = async () => {
    if (selectedActivities.length === 0) {
      toast({
        title: "No activities selected",
        description: "Please select at least one activity or deliverable.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Prepare the obligations object for the database.
    // This preserves existing data for selected activities and adds new ones.
    const newObligations = { ...deal.obligations };
    availableActivities.forEach(activity => {
        if (selectedActivities.includes(activity)) {
            // If the activity is selected but not yet in the obligations, initialize it.
            if (!newObligations[activity]) {
                 newObligations[activity] = []; // Or some default structure
            }
        } else {
            // If the activity is NOT selected, remove it from the obligations object.
            delete newObligations[activity];
        }
    });

    await updateDeal(dealId, { obligations: newObligations });

    // TODO: In the next chunk, we will build the logic to navigate to the
    // first of the selected activity forms. For now, we'll placeholder a navigation.
    navigate(`/dashboard`); // Placeholder navigation
    toast({
        title: "Next Step: Activity Forms",
        description: "We will build this part next!",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
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

export default Step3_SelectActivities;