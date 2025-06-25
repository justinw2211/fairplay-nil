// frontend/src/pages/DealWizard/Step7_Confirmation.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { Checkbox, VStack } from '@chakra-ui/react';

const Step7_Confirmation = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      is_paid_to_llc: false,
      is_group_deal: false,
    },
  });

  useEffect(() => {
    if (deal) {
      reset({
        is_paid_to_llc: deal.is_paid_to_llc || false,
        is_group_deal: deal.is_group_deal || false,
      });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    await updateDeal(dealId, formData);
    // Navigate to the final review step
    navigate(`/add/deal/confirmation/review/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="Final Details"
      instructions="Please indicate the final terms of your deal."
      onContinue={handleSubmit(onContinue)}
    >
      <VStack as="form" spacing={5} align="stretch" onSubmit={handleSubmit(onContinue)}>
        <Controller
          name="is_paid_to_llc"
          control={control}
          render={({ field }) => (
            <Checkbox
              isChecked={field.value}
              onChange={field.onChange}
              size="lg"
            >
              Are you being paid through an LLC or other business entity?
            </Checkbox>
          )}
        />
        <Controller
          name="is_group_deal"
          control={control}
          render={({ field }) => (
            <Checkbox
              isChecked={field.value}
              onChange={field.onChange}
              size="lg"
            >
              Is this a group deal involving other student-athletes?
            </Checkbox>
          )}
        />
      </VStack>
    </DealWizardLayout>
  );
};

export default Step7_Confirmation;