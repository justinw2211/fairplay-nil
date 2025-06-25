// frontend/src/pages/DealWizard/DealStep3.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useFMVContext } from '../../context/FMVContext';
import { dealStep3Schema } from '../../validation/schemas'; // IMPORT
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Stack,
  Radio,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  Collapse
} from '@chakra-ui/react';


const DealStep3 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFMVContext(); // Use updateFormData
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(dealStep3Schema), // USE IMPORTED SCHEMA
    defaultValues: {
        uses_school_ip: formData.uses_school_ip,
        has_conflicts: formData.has_conflicts
    }
  });

  const usesSchoolIP = watch('uses_school_ip');

  const onSubmit = (data) => {
    updateFormData(data);
    navigate('/dashboard/new-deal/step-4');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={8} align="stretch">
        <Heading as="h2" size="md" color="brand.textPrimary">
          Step 3: The Rules
        </Heading>
        <Text color="brand.textSecondary">
          Answer these key compliance questions. Honesty here protects your eligibility.
        </Text>

        <Controller
          name="uses_school_ip"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl isInvalid={errors.uses_school_ip}>
              <FormLabel color="brand.textPrimary">
                Does this deal require you to use any university logos, trademarks, or facilities (e.g., wearing your jersey in a photo)?
              </FormLabel>
              <RadioGroup onChange={(val) => onChange(val === 'true')} value={value?.toString()}>
                <Stack direction="row" spacing={5}>
                  <Radio value="true">Yes</Radio>
                  <Radio value="false">No</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.uses_school_ip?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        
        <Collapse in={usesSchoolIP} animateOpacity>
            <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Using school intellectual property (IP) almost always requires written permission from the compliance office. Proceed with caution.
            </Alert>
        </Collapse>

        <Controller
          name="has_conflicts"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl isInvalid={errors.has_conflicts}>
              <FormLabel color="brand.textPrimary">
                To your knowledge, does this deal conflict with any of your university's or team's existing sponsorships (e.g., a personal shoe deal when the team is sponsored by a rival brand)?
              </FormLabel>
              <RadioGroup onChange={onChange} value={value}>
                <Stack direction="row" spacing={5}>
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="unsure">I'm not sure</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.has_conflicts?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        
        <Flex mt={4}>
            <Button variant="outline" onClick={() => navigate('/dashboard/new-deal/step-2')}>
                Previous Step
            </Button>
            <Spacer />
            <Button
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                isLoading={isSubmitting}
                type="submit"
                _hover={{ bg: '#c8aeb0' }}
            >
                Next: The Agreement
            </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default DealStep3;