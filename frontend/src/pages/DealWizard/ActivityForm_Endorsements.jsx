// frontend/src/pages/DealWizard/ActivityForm_Endorsements.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Input, Textarea, VStack, HStack, FormErrorMessage } from '@chakra-ui/react';

const schema = yup.object().shape({
  description: yup.string().required('A description is required.'),
  start_date: yup.date().typeError('A valid start date is required.').required('Start date is required.'),
  end_date: yup.date().typeError('A valid end date is required.').required('End date is required.').min(yup.ref('start_date'), "End date can't be before start date"),
});

const ActivityForm_Endorsements = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { description: '', start_date: '', end_date: '' },
  });
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (deal?.obligations?.['Endorsements'] && Object.keys(deal.obligations['Endorsements']).length > 0) {
      const data = deal.obligations['Endorsements'];
      reset({
        ...data,
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
      });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    const newObligations = { ...deal.obligations, "Endorsements": formData };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
  };

  return (
    <DealWizardLayout
      title="Endorsement Details"
      instructions="Describe the product and how you will endorse it."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={4} onSubmit={handleSubmit(onContinue)}>
        <Controller name="description" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.description}>
            <FormLabel>Description of product and how it will be used</FormLabel>
            <Textarea {...field} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
        )} />
        <HStack w="full" spacing={4}>
          <Controller name="start_date" control={control} render={({ field }) => (
            <FormControl isInvalid={errors.start_date}>
              <FormLabel>Start Date</FormLabel>
              <Input {...field} type="date" />
              <FormErrorMessage>{errors.start_date?.message}</FormErrorMessage>
            </FormControl>
          )} />
          <Controller name="end_date" control={control} render={({ field }) => (
            <FormControl isInvalid={errors.end_date}>
              <FormLabel>End Date</FormLabel>
              <Input {...field} type="date" />
              <FormErrorMessage>{errors.end_date?.message}</FormErrorMessage>
            </FormControl>
          )} />
        </HStack>
      </VStack>
    </DealWizardLayout>
  );
};

export default ActivityForm_Endorsements;