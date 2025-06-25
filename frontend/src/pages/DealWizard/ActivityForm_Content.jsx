// frontend/src/pages/DealWizard/ActivityForm_Content.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Input, Textarea, VStack, FormErrorMessage } from '@chakra-ui/react';

const schema = yup.object().shape({
  quantity: yup.number().typeError('Must be a number').min(1, 'Quantity must be at least 1').required('Quantity is required.'),
  description: yup.string().required('A description is required.'),
});

const ActivityForm_Content = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { quantity: 1, description: '' },
  });

  useEffect(() => {
    if (deal?.obligations?.['Content for Brand'] && Object.keys(deal.obligations['Content for Brand']).length > 0) {
      reset(deal.obligations['Content for Brand']);
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    const newObligations = { ...deal.obligations, "Content for Brand": formData };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
  };

  return (
    <DealWizardLayout
      title="Content for Brand"
      instructions="Describe the content you will be creating."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={4} onSubmit={handleSubmit(onContinue)}>
        <Controller name="quantity" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.quantity}>
            <FormLabel>Quantity of pieces of content</FormLabel>
            <Input {...field} type="number" />
            <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
          </FormControl>
        )} />
        <Controller name="description" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.description}>
            <FormLabel>Description of content and how it will be used</FormLabel>
            <Textarea {...field} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
        )} />
      </VStack>
    </DealWizardLayout>
  );
};

export default ActivityForm_Content;