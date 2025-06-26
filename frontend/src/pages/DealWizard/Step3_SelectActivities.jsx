// In frontend/src/pages/DealWizard/Step3_SelectActivities.jsx

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