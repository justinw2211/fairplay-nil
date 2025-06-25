// frontend/src/pages/DealWizard/Step6_Compensation.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl, FormLabel, Input, Textarea, Button, VStack, HStack, IconButton, Text, Box, Heading, Divider, FormErrorMessage
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';

// Define validation schemas for the dynamic fields
const goodsSchema = yup.object().shape({
  description: yup.string().required('Description is required.'),
  estimated_value: yup.number().typeError('Must be a number').min(0, 'Value cannot be negative').required('Value is required.'),
});

const otherSchema = yup.object().shape({
  payment_type: yup.string().required('Type is required.'),
  description: yup.string().required('Description is required.'),
  estimated_value: yup.number().typeError('Must be a number').min(0, 'Value cannot be negative').required('Value is required.'),
});

// Main validation schema
const schema = yup.object().shape({
  compensation_cash: yup.number().typeError('Must be a valid number').min(0).nullable(),
  compensation_goods: yup.array().of(goodsSchema),
  compensation_other: yup.array().of(otherSchema),
}).test(
  'at-least-one-compensation',
  'At least one form of compensation is required.',
  (value) => !!value.compensation_cash || value.compensation_goods?.length > 0 || value.compensation_other?.length > 0
);


const Step6_Compensation = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      compensation_cash: null,
      compensation_goods: [],
      compensation_other: [],
    },
  });
  
  const { fields: goodsFields, append: appendGood, remove: removeGood } = useFieldArray({ control, name: "compensation_goods" });
  const { fields: otherFields, append: appendOther, remove: removeOther } = useFieldArray({ control, name: "compensation_other" });

  useEffect(() => {
    if (deal) {
      reset({
        compensation_cash: deal.compensation_cash || null,
        compensation_goods: deal.compensation_goods || [],
        compensation_other: deal.compensation_other || [],
      });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    // Filter out empty cash value if user deletes it
    const dataToUpdate = {
        ...formData,
        compensation_cash: formData.compensation_cash || null
    };
    await updateDeal(dealId, dataToUpdate);
    navigate(`/add/deal/confirmation/details/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="How are you being paid?"
      instructions="Add all forms of compensation for this deal."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={8} divider={<Divider />} onSubmit={handleSubmit(onContinue)}>
        
        {/* Section 1: Cash */}
        <Box w="full">
          <Heading as="h3" size="md" mb={4}>Cash or Cash Equivalent</Heading>
          <Controller
            name="compensation_cash"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.compensation_cash}>
                <FormLabel>Total amount in USD</FormLabel>
                <Input {...field} type="number" placeholder="e.g., 500.00" />
                <FormErrorMessage>{errors.compensation_cash?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Box>

        {/* Section 2: Goods & Services */}
        <Box w="full">
            <Heading as="h3" size="md" mb={4}>Goods, Services, & Experiences</Heading>
            {goodsFields.map((item, index) => (
                <VStack key={item.id} p={4} borderWidth={1} borderRadius="md" mb={4} align="stretch">
                    <HStack spacing={4}>
                         <Controller name={`compensation_goods.${index}.description`} control={control} render={({ field }) => (
                            <FormControl isInvalid={!!errors.compensation_goods?.[index]?.description}><FormLabel>Description</FormLabel><Textarea {...field} /></FormControl>
                         )} />
                         <Controller name={`compensation_goods.${index}.estimated_value`} control={control} render={({ field }) => (
                            <FormControl isInvalid={!!errors.compensation_goods?.[index]?.estimated_value} maxW="200px"><FormLabel>Est. Value (USD)</FormLabel><Input {...field} type="number" /></FormControl>
                         )} />
                         <IconButton aria-label="Delete item" icon={<DeleteIcon />} onClick={() => removeGood(index)} alignSelf="flex-end" />
                    </HStack>
                </VStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={() => appendGood({ description: '', estimated_value: '' })}>Add Item</Button>
        </Box>

        {/* Section 3: Other Payments */}
        <Box w="full">
            <Heading as="h3" size="md" mb={4}>Other Payments (Royalties, Bonuses, etc.)</Heading>
            {otherFields.map((item, index) => (
                <VStack key={item.id} p={4} borderWidth={1} borderRadius="md" mb={4} align="stretch">
                    <HStack spacing={4}>
                         <Controller name={`compensation_other.${index}.payment_type`} control={control} render={({ field }) => (
                            <FormControl isInvalid={!!errors.compensation_other?.[index]?.payment_type}><FormLabel>Payment Type</FormLabel><Input {...field} placeholder="e.g., Royalties" /></FormControl>
                         )} />
                         <Controller name={`compensation_other.${index}.description`} control={control} render={({ field }) => (
                            <FormControl isInvalid={!!errors.compensation_other?.[index]?.description}><FormLabel>Description / Terms</FormLabel><Textarea {...field} /></FormControl>
                         )} />
                         <Controller name={`compensation_other.${index}.estimated_value`} control={control} render={({ field }) => (
                            <FormControl isInvalid={!!errors.compensation_other?.[index]?.estimated_value} maxW="200px"><FormLabel>Est. Value (USD)</FormLabel><Input {...field} type="number" /></FormControl>
                         )} />
                         <IconButton aria-label="Delete item" icon={<DeleteIcon />} onClick={() => removeOther(index)} alignSelf="flex-end" />
                    </HStack>
                </VStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={() => appendOther({ payment_type: '', description: '', estimated_value: '' })}>Add Other Payment</Button>
        </Box>

        {/* Display the main validation error if no compensation is provided */}
        {errors.root && <Text color="red.500" fontSize="sm">{errors.root.message}</Text>}

      </VStack>
    </DealWizardLayout>
  );
};

export default Step6_Compensation;