// frontend/src/pages/DealWizard/Step5_Compliance.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Radio, RadioGroup, Stack, VStack, FormErrorMessage } from '@chakra-ui/react';

// Validation schema to ensure all questions are answered.
const schema = yup.object().shape({
  grant_exclusivity: yup.string().required('An answer is required.'),
  uses_school_ip: yup.string().required('An answer is required.'), // We use a string here for 'Yes'/'No'/'I'm not sure'
  licenses_NIL: yup.string().required('An answer is required.'),
});

const Step5_Compliance = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      grant_exclusivity: '',
      uses_school_ip: '',
      licenses_NIL: '',
    },
  });

  // This function converts the boolean from the DB to the string 'Yes'/'No' for the form
  const boolToString = (val) => {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return ''; // Handle null or undefined
  }

  // Populate the form when deal data is available.
  useEffect(() => {
    if (deal) {
      reset({
        grant_exclusivity: deal.grant_exclusivity || '',
        uses_school_ip: boolToString(deal.uses_school_ip),
        licenses_NIL: deal.licenses_NIL || '',
      });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    // Convert 'Yes'/'No' back to boolean for uses_school_ip for DB consistency
    const updateData = {
      ...formData,
      uses_school_ip: formData.uses_school_ip === 'Yes' ? true : (formData.uses_school_ip === 'No' ? false : null)
    };
    await updateDeal(dealId, updateData);
    // Navigate to the next step
    navigate(`/add/deal/compensation/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="Compliance Questions"
      instructions="Please answer the following questions to the best of your ability."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={8} align="stretch" onSubmit={handleSubmit(onContinue)}>
        {/* Question 1: Granting Exclusive Rights? */}
        <Controller
          name="grant_exclusivity"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.grant_exclusivity}>
              <FormLabel>Are you granting the payor exclusive rights to your NIL in any area (e.g., exclusive beverage partner)?</FormLabel>
              <RadioGroup {...field}>
                <Stack direction="row" spacing={6}>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I’m not sure">I’m not sure</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.grant_exclusivity?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        {/* Question 2: Is School Branding Visible? */}
        <Controller
          name="uses_school_ip"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.uses_school_ip}>
              <FormLabel>Will any of your school's branding (e.g., logos, facilities, uniforms) be visible in the content you create?</FormLabel>
              <RadioGroup {...field}>
                <Stack direction="row" spacing={6}>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I’m not sure">I’m not sure</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.uses_school_ip?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        {/* Question 3: Are You Licensing Your NIL? */}
        <Controller
          name="licenses_NIL"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.licenses_NIL}>
              <FormLabel>Are you licensing your NIL for use in merchandise or products (e.g., on a t-shirt or video game)?</FormLabel>
              <RadioGroup {...field}>
                <Stack direction="row" spacing={6}>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I’m not sure">I’m not sure</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.licenses_NIL?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
      </VStack>
    </DealWizardLayout>
  );
};

export default Step5_Compliance;