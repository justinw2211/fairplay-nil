// frontend/src/pages/DealWizard/Step2_PayorInfo.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, FormErrorMessage, Input, VStack } from '@chakra-ui/react';

// Define the validation schema for the form fields
const schema = yup.object().shape({
  payor_name: yup.string().required('Payor Name is required.'),
  contact_name: yup.string().required('Contact Name is required.'),
  contact_email: yup.string().email('Must be a valid email.').required('Email Address is required.'),
  contact_phone: yup.string(), // Optional field
});

const Step2_PayorInfo = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal, loading } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange', // Validate on change to enable/disable the continue button
    defaultValues: {
      payor_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
    },
  });

  // When the deal data is loaded from context, populate the form fields.
  useEffect(() => {
    if (deal) {
      reset({
        payor_name: deal.payor_name || '',
        contact_name: deal.contact_name || '',
        contact_email: deal.contact_email || '',
        contact_phone: deal.contact_phone || '',
      });
    }
  }, [deal, reset]);

  // This function is called on form submission.
  const onContinue = async (formData) => {
    await updateDeal(dealId, formData);
    // Navigate to the next step
    navigate(`/add/deal/activities/select/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="What business are you working with?"
      instructions="Please provide the contact information for the payor."
      onContinue={handleSubmit(onContinue)} // The layout's button now triggers the form submission
      isContinueDisabled={!isValid} // Disable continue if the form is not valid
    >
      <VStack as="form" spacing={4} onSubmit={handleSubmit(onContinue)}>
        <Controller
          name="payor_name"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.payor_name}>
              <FormLabel>Payor Name</FormLabel>
              <Input {...field} />
              <FormErrorMessage>{errors.payor_name?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="contact_name"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.contact_name}>
              <FormLabel>Contact Name</FormLabel>
              <Input {...field} />
              <FormErrorMessage>{errors.contact_name?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="contact_email"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.contact_email}>
              <FormLabel>Email Address</FormLabel>
              <Input {...field} type="email" />
              <FormErrorMessage>{errors.contact_email?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="contact_phone"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.contact_phone}>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <Input {...field} type="tel" />
              <FormErrorMessage>{errors.contact_phone?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
      </VStack>
    </DealWizardLayout>
  );
};

export default Step2_PayorInfo;