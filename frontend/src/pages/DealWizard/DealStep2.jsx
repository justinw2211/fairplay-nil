// frontend/src/pages/DealWizard/DealStep2.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useFMVContext } from '../../context/FMVContext';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  VStack,
  Heading,
  Text,
  Select,
  Textarea,
  Collapse,
  Flex,
  Spacer
} from '@chakra-ui/react';

// Validation Schema for Step 2
const schema = yup.object().shape({
  compensation_type: yup.string().required('Please select a compensation type.'),
  compensation_amount: yup.number()
    .transform(value => (isNaN(value) ? undefined : value))
    .nullable()
    .when('compensation_type', {
        is: (val) => val === 'Cash' || val === 'Mixed',
        then: (schema) => schema.required('Cash amount is required for this compensation type.').min(0),
        otherwise: (schema) => schema.optional(),
    }),
  compensation_in_kind_description: yup.string().when('compensation_type', {
    is: (val) => val === 'In-Kind' || val === 'Mixed',
    then: (schema) => schema.required('Please describe the goods or services.'),
    otherwise: (schema) => schema.optional(),
  }),
});


const DealStep2 = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFMVContext();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      compensation_type: formData.compensation_type || '',
      compensation_amount: formData.compensation_amount || '',
      compensation_in_kind_description: formData.compensation_in_kind_description || '',
    },
  });

  const compensationType = watch('compensation_type');

  const onSubmit = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    navigate('/dashboard/new-deal/step-3');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="md" color="brand.textPrimary">
          Step 2: Compensation
        </Heading>
        <Text color="brand.textSecondary">
          Specify the payment details for this deal. This is critical for determining Fair Market Value.
        </Text>

        <Controller
          name="compensation_type"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.compensation_type}>
              <FormLabel color="brand.textPrimary">Compensation Type</FormLabel>
              <Select {...field} placeholder="Select compensation type">
                <option value="Cash">Cash Only</option>
                <option value="In-Kind">In-Kind Only (Goods or Services)</option>
                <option value="Mixed">Mixed (Cash and In-Kind)</option>
              </Select>
              <FormErrorMessage>{errors.compensation_type?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        <Collapse in={compensationType === 'Cash' || compensationType === 'Mixed'} animateOpacity>
            <Controller
                name="compensation_amount"
                control={control}
                render={({ field }) => (
                    <FormControl isInvalid={errors.compensation_amount}>
                        <FormLabel color="brand.textPrimary">Cash Amount</FormLabel>
                        <InputGroup>
                            <InputLeftElement
                                pointerEvents="none"
                                color="gray.400"
                                fontSize="1.2em"
                                children="$"
                            />
                            <Input {...field} placeholder="e.g., 500.00" type="number" step="0.01" />
                        </InputGroup>
                        <FormErrorMessage>{errors.compensation_amount?.message}</FormErrorMessage>
                    </FormControl>
                )}
            />
        </Collapse>
        
        <Collapse in={compensationType === 'In-Kind' || compensationType === 'Mixed'} animateOpacity>
            <Controller
                name="compensation_in_kind_description"
                control={control}
                render={({ field }) => (
                    <FormControl isInvalid={errors.compensation_in_kind_description} mt={4}>
                        <FormLabel color="brand.textPrimary">In-Kind Goods or Services</FormLabel>
                        <Textarea {...field} placeholder="Describe the items, e.g., 'One pair of headphones, model XYZ'." />
                        <FormHelperText>Be as specific as possible.</FormHelperText>
                        <FormErrorMessage>{errors.compensation_in_kind_description?.message}</FormErrorMessage>
                    </FormControl>
                )}
            />
        </Collapse>


        <Flex mt={4}>
            <Button variant="outline" onClick={() => navigate('/dashboard/new-deal/step-1')}>
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
                Next: The Rules
            </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default DealStep2;