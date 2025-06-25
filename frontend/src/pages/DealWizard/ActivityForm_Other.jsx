// frontend/src/pages/DealWizard/ActivityForm_Other.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Textarea, VStack, FormErrorMessage } from '@chakra-ui/react';

const schema = yup.object().shape({
  description: yup.string().required('A description is required.'),
});

const ActivityForm_Other = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { description: '' },
  });

  useEffect(() => {
    if (deal?.obligations?.['Other'] && Object.keys(deal.obligations['Other']).length > 0) {
      reset(deal.obligations['Other']);
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    const newObligations = { ...deal.obligations, "Other": formData };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
  };

  return (
    <DealWizardLayout
      title="Other Activity Details"
      instructions="Describe any other activities or deliverables not covered in the previous steps."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={4} onSubmit={handleSubmit(onContinue)}>
        <Controller name="description" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.description}>
            <FormLabel>Description of activity or deliverable</FormLabel>
            <Textarea {...field} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
        )} />
      </VStack>
    </DealWizardLayout>
  );
};

export default ActivityForm_Other;