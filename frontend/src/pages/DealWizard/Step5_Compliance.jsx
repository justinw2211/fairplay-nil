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
  uses_school_ip: yup.string().required('An answer is required.'),
  licenses_nil: yup.string().required('An answer is required.'),
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
      licenses_nil: '',
    },
  });

  const boolToString = (val) => {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return '';
  };

  const stringToBool = (val) => {
    if (val === 'Yes') return true;
    if (val === 'No') return false;
    return null;
  };

  useEffect(() => {
    if (deal) {
      reset({
        grant_exclusivity: boolToString(deal.grant_exclusivity),
        uses_school_ip: boolToString(deal.uses_school_ip),
        licenses_nil: boolToString(deal.licenses_nil),
      });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    await updateDeal(dealId, {
      grant_exclusivity: stringToBool(formData.grant_exclusivity),
      uses_school_ip: stringToBool(formData.uses_school_ip),
      licenses_nil: stringToBool(formData.licenses_nil),
    });
    navigate(`/add/deal/compliance/docs/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="Compliance Check"
      instructions="Answer the following to help determine whether this deal meets NCAA guidelines."
      onContinue={handleSubmit(onContinue)}
    >
      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.grant_exclusivity}>
          <FormLabel>Does this deal give the sponsor exclusive rights (e.g., you cannot work with competitors)?</FormLabel>
          <Controller
            name="grant_exclusivity"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="column">
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I'm not sure">I'm not sure</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.grant_exclusivity?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.uses_school_ip}>
          <FormLabel>Does this deal involve use of your school's logo, facilities, or reputation?</FormLabel>
          <Controller
            name="uses_school_ip"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="column">
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I'm not sure">I'm not sure</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.uses_school_ip?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.licenses_nil}>
          <FormLabel>Does this deal involve licensing your NIL to a third party (e.g., video game company)?</FormLabel>
          <Controller
            name="licenses_nil"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="column">
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                  <Radio value="I'm not sure">I'm not sure</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.licenses_nil?.message}</FormErrorMessage>
        </FormControl>
      </VStack>
    </DealWizardLayout>
  );
};

export default Step5_Compliance;
