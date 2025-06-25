// frontend/src/pages/DealWizard/DealStep4.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useFMVContext } from '../../context/FMVContext';
import { dealStep4Schema } from '../../validation/schemas'; // IMPORT
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  VStack,
  Heading,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Collapse,
  Input,
  Flex,
  Spacer
} from '@chakra-ui/react';
import ContractUpload from './ContractUpload';

const DealStep4 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFMVContext(); // Use updateFormData

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(dealStep4Schema), // USE IMPORTED SCHEMA
    defaultValues: {
        has_written_contract: formData.has_written_contract,
        is_using_agent: formData.is_using_agent,
        agent_name: formData.agent_name || '',
        agent_agency: formData.agent_agency || '',
    }
  });

  const isUsingAgent = watch('is_using_agent');
  const hasWrittenContract = watch('has_written_contract');

  const onSubmit = (data) => {
    updateFormData(data);
    navigate('/dashboard/new-deal/review');
  };

  // Callback function for the uploader component
  const handleUploadComplete = (url) => {
    setValue('contract_url', url, { shouldValidate: true });
    updateFormData({ contract_url: url });
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={8} align="stretch">
        <Heading as="h2" size="md" color="brand.textPrimary">
          Step 4: The Agreement
        </Heading>
        <Text color="brand.textSecondary">
          Finally, let's confirm the details of the formal agreement.
        </Text>

        <Controller
          name="has_written_contract"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl isInvalid={errors.has_written_contract}>
              <FormLabel color="brand.textPrimary">Is there a written contract for this deal?</FormLabel>
              <RadioGroup onChange={(val) => onChange(val === 'true')} value={value?.toString()}>
                <Stack direction="row" spacing={5}>
                  <Radio value="true">Yes</Radio>
                  <Radio value="false">No</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.has_written_contract?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        
        <Collapse in={hasWrittenContract} animateOpacity>
           <FormControl>
                <FormLabel color="brand.textPrimary">Upload a copy of the contract (Optional)</FormLabel>
                <Text fontSize="sm" color="brand.textSecondary" mb={2}>
                    Providing a copy can speed up official reviews. PDFs only.
                </Text>
                <ContractUpload onUploadComplete={handleUploadComplete} />
           </FormControl>
        </Collapse>

        <Controller
          name="is_using_agent"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl isInvalid={errors.is_using_agent} mt={4}>
              <FormLabel color="brand.textPrimary">Are you using an agent or lawyer for this deal?</FormLabel>
              <RadioGroup onChange={(val) => onChange(val === 'true')} value={value?.toString()}>
                <Stack direction="row" spacing={5}>
                  <Radio value="true">Yes</Radio>
                  <Radio value="false">No</Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.is_using_agent?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        <Collapse in={isUsingAgent} animateOpacity>
          <VStack spacing={4} mt={4}>
              <Controller
                  name="agent_name"
                  control={control}
                  render={({ field }) => (
                      <FormControl isInvalid={errors.agent_name}>
                          <FormLabel color="brand.textPrimary">Agent Full Name</FormLabel>
                          <Input {...field} placeholder="e.g., Jane Doe" />
                          <FormErrorMessage>{errors.agent_name?.message}</FormErrorMessage>
                      </FormControl>
                  )}
              />
              <Controller
                  name="agent_agency"
                  control={control}
                  render={({ field }) => (
                      <FormControl isInvalid={errors.agent_agency}>
                          <FormLabel color="brand.textPrimary">Agent's Company or Agency</FormLabel>
                          <Input {...field} placeholder="e.g., Sports Talent Agency" />
                          <FormErrorMessage>{errors.agent_agency?.message}</FormErrorMessage>
                      </FormControl>
                  )}
              />
          </VStack>
        </Collapse>

        <Flex mt={4}>
            <Button variant="outline" onClick={() => navigate('/dashboard/new-deal/step-3')}>
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
                Review Deal
            </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default DealStep4;