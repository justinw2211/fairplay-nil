import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CreatableSelect from 'react-select/creatable';
import {
  Box, Button, Flex, Heading, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, SimpleGrid, FormErrorMessage,
  Text, Select as ChakraSelect, InputGroup, InputLeftElement, Icon,
} from '@chakra-ui/react';
import {
  FiInstagram, FiMusic, FiYoutube,
} from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';

import { useFMV } from '../../context/FMVContext';
import { fullFmvSchema } from '../../validation/schemas';

const PAYMENT_STRUCTURES = [
  { label: 'Flat Fee', value: 'Flat Fee' },
  { label: 'Revenue Share', value: 'Revenue Share' },
  { label: 'Other', value: 'Other' },
];
const DEAL_CATEGORIES = [
  { label: 'Apparel', value: 'Apparel' },
  { label: 'Sports Equipment', value: 'Sports Equipment' },
  { label: 'Events', value: 'Events' },
  { label: 'Other', value: 'Other' },
];
const DELIVERABLE_OPTIONS = [
  { label: 'Instagram Story', value: 'Instagram Story' },
  { label: 'Instagram Post', value: 'Instagram Post' },
  { label: 'TikTok Video', value: 'TikTok Video' },
  { label: 'Autograph Signing', value: 'Autograph Signing' },
  { label: 'Other', value: 'Other' },
];
const DEAL_TYPES = [
  { label: 'Social Media', value: 'Social Media' },
  { label: 'In-Person', value: 'In-Person' },
  { label: 'Appearances', value: 'Appearances' },
  { label: 'Other', value: 'Other' },
];

const creatableSelectStyles = (hasError) => ({ 
    control: (base, state) => ({
    ...base,
    background: 'white',
    minHeight: '40px',
    borderColor: hasError ? '#E53E3E' : state.isFocused ? '#d0bdb5' : '#d6dce4',
    boxShadow: hasError ? '0 0 0 1px #E53E3E' : state.isFocused ? '0 0 0 1px #d0bdb5' : 'none',
    '&:hover': { borderColor: hasError ? '#E53E3E' : '#d0bdb5' },
  }),
});

const step2Fields = [
    'followers_instagram', 'followers_tiktok', 'followers_twitter', 'followers_youtube',
    'payment_structure', 'payment_structure_other', 'deal_length_months',
    'proposed_dollar_amount', 'deal_category', 'brand_partner', 'deliverables',
    'deliverable_other', 'deal_type', 'is_real_submission'
];

export default function FMVStep2({ onBack, onNext }) {
  const { formData, updateFormData } = useFMV();
  
  const step2Schema = yup.object().shape(
    step2Fields.reduce((acc, fieldName) => {
        if(fullFmvSchema.fields[fieldName]) {
            acc[fieldName] = fullFmvSchema.fields[fieldName];
        }
        return acc;
    }, {})
  );

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(step2Schema),
    defaultValues: formData,
    mode: 'onChange',
  });

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };
  
  const paymentStructureValue = watch('payment_structure');
  const deliverablesValue = watch('deliverables') || [];

  return (
     <Flex minH="calc(100vh - 88px)" align="center" justify="center" p={4}>
        <Stack spacing={6} w="full" maxW="2xl" bg="brand.secondary" p={{ base: 6, md: 8 }} borderRadius="xl" shadow="lg">
            <Heading size="lg">Social & Deal Details</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                 <Stack spacing={5}>
                    <Heading size="md" color="brand.textSecondary" pt={2}>Social Following</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl isInvalid={!!errors.followers_instagram}>
                        <FormLabel>Instagram</FormLabel>
                        <InputGroup><InputLeftElement pointerEvents="none"><Icon as={FiInstagram} color="gray.400" /></InputLeftElement><Controller name="followers_instagram" control={control} render={({ field }) => <NumberInput {...field} w="full" value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField pl={10} /></NumberInput>} /></InputGroup>
                        <FormErrorMessage>{errors.followers_instagram?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.followers_tiktok}>
                        <FormLabel>TikTok</FormLabel>
                        <InputGroup><InputLeftElement pointerEvents="none"><Icon as={FiMusic} color="gray.400" /></InputLeftElement><Controller name="followers_tiktok" control={control} render={({ field }) => <NumberInput {...field} w="full" value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField pl={10} /></NumberInput>} /></InputGroup>
                        <FormErrorMessage>{errors.followers_tiktok?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.followers_twitter}>
                        <FormLabel>X (Twitter)</FormLabel>
                        <InputGroup><InputLeftElement pointerEvents="none"><Icon as={FaXTwitter} color="gray.400" /></InputLeftElement><Controller name="followers_twitter" control={control} render={({ field }) => <NumberInput {...field} w="full" value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField pl={10} /></NumberInput>} /></InputGroup>
                        <FormErrorMessage>{errors.followers_twitter?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!errors.followers_youtube}>
                        <FormLabel>YouTube</FormLabel>
                        <InputGroup><InputLeftElement pointerEvents="none"><Icon as={FiYoutube} color="gray.400" /></InputLeftElement><Controller name="followers_youtube" control={control} render={({ field }) => <NumberInput {...field} w="full" value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField pl={10} /></NumberInput>} /></InputGroup>
                        <FormErrorMessage>{errors.followers_youtube?.message}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>

                    <Heading size="md" color="brand.textSecondary" pt={4}>Deal Details</Heading>
                    <FormControl isInvalid={!!errors.payment_structure} isRequired>
                      <FormLabel>Payment Structure</FormLabel>
                      <ChakraSelect {...register('payment_structure')}><option value="">Select...</option>{PAYMENT_STRUCTURES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</ChakraSelect>
                      <FormErrorMessage>{errors.payment_structure?.message}</FormErrorMessage>
                    </FormControl>
                    {paymentStructureValue === 'Other' && <FormControl isInvalid={!!errors.payment_structure_other} isRequired><FormLabel>Describe Other Structure</FormLabel><Input {...register('payment_structure_other')} /><FormErrorMessage>{errors.payment_structure_other?.message}</FormErrorMessage></FormControl>}
                    <FormControl isInvalid={!!errors.deal_length_months} isRequired>
                      <FormLabel>Deal Length (months)</FormLabel>
                      <Controller name="deal_length_months" control={control} render={({ field }) => <NumberInput {...field} min={1} value={field.value || ''} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField /></NumberInput>} />
                      <FormErrorMessage>{errors.deal_length_months?.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.proposed_dollar_amount} isRequired>
                      <FormLabel>Total Proposed $</FormLabel>
                      <Controller name="proposed_dollar_amount" control={control} render={({ field }) => <NumberInput {...field} min={0} value={field.value || ''} precision={2} onChange={val => field.onChange(val ? Number(val) : '')}><NumberInputField /></NumberInput>} />
                      <FormErrorMessage>{errors.proposed_dollar_amount?.message}</FormErrorMessage>
                    </FormControl>
                     <FormControl isInvalid={!!errors.deal_category} isRequired>
                      <FormLabel>Deal Category</FormLabel>
                      <ChakraSelect {...register('deal_category')}><option value="">Select...</option>{DEAL_CATEGORIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</ChakraSelect>
                      <FormErrorMessage>{errors.deal_category?.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.brand_partner} isRequired>
                      <FormLabel>Brand Partner</FormLabel>
                      <Input {...register('brand_partner')} />
                      <FormErrorMessage>{errors.brand_partner?.message}</FormErrorMessage>
                    </FormControl>
                     <FormControl isInvalid={!!errors.deliverables} isRequired>
                      <FormLabel>Deliverables</FormLabel>
                      <Controller name="deliverables" control={control} render={({ field }) => <CreatableSelect isMulti {...field} options={DELIVERABLE_OPTIONS} styles={creatableSelectStyles(!!errors.deliverables)} value={(field.value || []).map(v => ({label: v, value: v}))} onChange={val => field.onChange(val.map(v => v.value))} />} />
                      <FormErrorMessage>{errors.deliverables?.message}</FormErrorMessage>
                    </FormControl>
                    {deliverablesValue.includes('Other') && <FormControl isInvalid={!!errors.deliverable_other} isRequired><FormLabel>Describe Other Deliverable</FormLabel><Input {...register('deliverable_other')} /><FormErrorMessage>{errors.deliverable_other?.message}</FormErrorMessage></FormControl>}
                     <FormControl isInvalid={!!errors.deal_type}>
                      <FormLabel>Deal Types (optional)</FormLabel>
                      <Controller name="deal_type" control={control} render={({ field }) => <CreatableSelect isMulti {...field} options={DEAL_TYPES} styles={creatableSelectStyles(!!errors.deal_type)} value={(field.value || []).map(v => ({label: v, value: v}))} onChange={val => field.onChange(val.map(v => v.value))} />} />
                      <FormErrorMessage>{errors.deal_type?.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.is_real_submission} isRequired>
                      <FormLabel>Is this a real submission?</FormLabel>
                      <Controller name="is_real_submission" control={control} render={({ field }) => <Flex gap={4}><Button variant={field.value === 'yes' ? 'solid' : 'outline'} onClick={() => field.onChange('yes')}>Yes</Button><Button variant={field.value === 'no' ? 'solid' : 'outline'} onClick={() => field.onChange('no')}>No (Test/Demo)</Button></Flex>} />
                      <FormErrorMessage>{errors.is_real_submission?.message}</FormErrorMessage>
                    </FormControl>
                 </Stack>
                 <Flex mt={8} justify="space-between">
                    <Button onClick={onBack} variant="outline">Back</Button>
                    <Button type="submit">Review</Button>
                 </Flex>
            </form>
        </Stack>
     </Flex>
  );
}
