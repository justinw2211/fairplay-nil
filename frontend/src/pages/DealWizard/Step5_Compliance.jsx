// frontend/src/pages/DealWizard/Step5_Compliance.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  VStack,
  Button,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react';

const schema = yup.object().shape({
  grant_exclusivity: yup.string().required('An answer is required.'),
  uses_school_ip: yup.string().required('An answer is required.'),
  licenses_nil: yup.string().required('An answer is required.'), // <-- fixed case
});

const Step5_Compliance = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { deal, updateDeal } = useDeal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      grant_exclusivity: '',
      uses_school_ip: '',
      licenses_nil: '',
    }
  });

  const boolToString = (val) => {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return '';
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

  const onSubmit = async (data) => {
    try {
      const update = {
        grant_exclusivity: data.grant_exclusivity,
        uses_school_ip: data.uses_school_ip,
        licenses_nil: data.licenses_nil,
        compliance_confirmed: true
      };

      const result = await updateDeal(dealId, update);
      if (result?.error) {
        throw new Error(result.error.message);
      }

      navigate(`/add/deal/confirmation/success/${dealId}`);
    } catch (err) {
      console.error("[Step5_Compliance] Submission failed", err);
      toast({
        title: 'Update failed',
        description: err.message || 'There was a problem submitting your compliance information.',
        status: 'error',
        duration: 6000,
        isClosable: true
      });
    }
  };

  return (
    <DealWizardLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6} align="start">
          <FormControl isInvalid={!!errors.licenses_nil}>
            <FormLabel>Does this deal require NIL licensing?</FormLabel>
            <Controller
              name="licenses_nil"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <Stack direction="row">
                    <Radio value="Yes">Yes</Radio>
                    <Radio value="No">No</Radio>
                    <Radio value="I'm not sure">I'm not sure</Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
            <FormErrorMessage>{errors.licenses_nil?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.grant_exclusivity}>
            <FormLabel>Does this deal grant the brand exclusivity?</FormLabel>
            <Controller
              name="grant_exclusivity"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <Stack direction="row">
                    <Radio value="Yes">Yes</Radio>
                    <Radio value="No">No</Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
            <FormErrorMessage>{errors.grant_exclusivity?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.uses_school_ip}>
            <FormLabel>Does this deal use the school's logos, trademarks, or IP?</FormLabel>
            <Controller
              name="uses_school_ip"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <Stack direction="row">
                    <Radio value="Yes">Yes</Radio>
                    <Radio value="No">No</Radio>
                    <Radio value="I'm not sure">I'm not sure</Radio>
                  </Stack>
                </RadioGroup>
              )}
            />
            <FormErrorMessage>{errors.uses_school_ip?.message}</FormErrorMessage>
          </FormControl>

          <Button colorScheme="green" type="submit">
            Submit Compliance Info
          </Button>
        </VStack>
      </form>
    </DealWizardLayout>
  );
};

export default Step5_Compliance;
