// frontend/src/pages/DealWizard/ActivityForm_Appearance.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Input, Select, VStack, FormErrorMessage } from '@chakra-ui/react';

const schema = yup.object().shape({
  type: yup.string().required('Type of appearance is required.'),
  quantity: yup.number().typeError('Must be a number').min(1, 'Quantity must be at least 1').required('Quantity is required.'),
  hours_per: yup.number().typeError('Must be a number').positive('Hours must be positive').optional().nullable(),
});

const ActivityForm_Appearance = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { type: '', quantity: 1, hours_per: '' },
  });

  useEffect(() => {
    if (deal?.obligations?.['Appearance'] && Object.keys(deal.obligations['Appearance']).length > 0) {
      reset(deal.obligations['Appearance']);
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    const newObligations = { ...deal.obligations, "Appearance": formData };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
  };

  return (
    <DealWizardLayout
      title="Appearance Details"
      instructions="Provide the details for the appearance(s)."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={4} onSubmit={handleSubmit(onContinue)}>
        <Controller name="type" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.type}>
            <FormLabel>Type of Appearance</FormLabel>
            <Select {...field} placeholder="Select Type">
              <option value="Not yet determined">Not yet determined</option>
              <option value="Production shoot">Production shoot</option>
              <option value="Interview">Interview</option>
              <option value="Meet and greet">Meet and greet</option>
              <option value="Autograph signing session">Autograph signing session</option>
              <option value="Sport demonstration or camp">Sport demonstration or camp</option>
              <option value="Other">Other</option>
            </Select>
            <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
          </FormControl>
        )} />
        <Controller name="quantity" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.quantity}>
            <FormLabel>Quantity</FormLabel>
            <Input {...field} type="number" />
            <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
          </FormControl>
        )} />
        <Controller name="hours_per" control={control} render={({ field }) => (
          <FormControl isInvalid={errors.hours_per}>
            <FormLabel>Hours Per Appearance (Optional)</FormLabel>
            <Input {...field} type="number" />
            <FormErrorMessage>{errors.hours_per?.message}</FormErrorMessage>
          </FormControl>
        )} />
      </VStack>
    </DealWizardLayout>
  );
};

export default ActivityForm_Appearance;