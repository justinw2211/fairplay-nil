import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step2Schema } from '../validation/schemas';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, useToast, Text, Select as ChakraSelect, FormErrorMessage
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";

const DELIVERABLE_OPTIONS = [
  { label: "Instagram Story", value: "Instagram Story" },
  { label: "Instagram Post", value: "Instagram Post" },
  // ... more options
  { label: "Other", value: "Other" }
];
const PAYMENT_STRUCTURES = [
  { label: "Flat Fee", value: "Flat Fee" },
  // ... more options
  { label: "Other", value: "Other" }
];
// ... Other constant arrays

export default function FMVStep2({ onBack, onNext }) {
  const { formData, updateFormData } = useFMV();
  const toast = useToast();

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(step2Schema),
    defaultValues: formData,
  });

  const paymentStructureValue = watch('payment_structure');
  const deliverablesValue = watch('deliverables');

  const onSubmit = (data) => {
    updateFormData(data);
    if (onNext) onNext();
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}>
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Box mb={6}>
          <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">Step 2 of 2: Deal Details</Text>
          <Progress value={100} size="md" colorScheme="green" borderRadius="full" hasStripe isAnimated mb={2} />
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            <Heading fontSize="2xl" color="white">Deal Details</Heading>
            
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabel>Payment Structure</FormLabel>
              <ChakraSelect {...register("payment_structure")} bg="gray.800" borderColor="#555">
                <option value="">Select...</option>
                {PAYMENT_STRUCTURES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </ChakraSelect>
              <FormErrorMessage>{errors.payment_structure?.message}</FormErrorMessage>
            </FormControl>

            {paymentStructureValue === 'Other' && (
              <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
                <FormLabel>Please describe</FormLabel>
                <Input {...register("payment_structure_other")} placeholder="Describe payment structure" bg="gray.800" />
                <FormErrorMessage>{errors.payment_structure_other?.message}</FormErrorMessage>
              </FormControl>
            )}
            
            {/* ... other form controls refactored similarly using register and Controller ... */}

            <FormControl isRequired isInvalid={!!errors.deliverables}>
              <FormLabel>Deliverables</FormLabel>
              <Controller name="deliverables" control={control} render={({ field }) => (
                <CreatableSelect isMulti options={DELIVERABLE_OPTIONS}
                  value={DELIVERABLE_OPTIONS.filter(o => field.value?.includes(o.value))}
                  onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                  styles={{...}} />
              )}/>
               <FormErrorMessage>{errors.deliverables?.message}</FormErrorMessage>
            </FormControl>
            
             {/* ... And so on for the rest of the fields ... */}

            <FormControl isRequired isInvalid={!!errors.is_real_submission}>
                <FormLabel>Is this a real submission?</FormLabel>
                <Controller name="is_real_submission" control={control} render={({ field }) => (
                    <Flex gap={5}>
                        <Button variant={field.value === 'yes' ? 'solid' : 'outline'} colorScheme="green" onClick={() => field.onChange('yes')}>Yes</Button>
                        <Button variant={field.value === 'no' ? 'solid' : 'outline'} colorScheme="gray" onClick={() => field.onChange('no')}>No (Test/Demo)</Button>
                    </Flex>
                )} />
                <FormErrorMessage>{errors.is_real_submission?.message}</FormErrorMessage>
            </FormControl>

          </Stack>
          <Flex mt={8} justify="space-between">
            <Button onClick={onBack} colorScheme="green" variant="outline" style={{...}}>Back</Button>
            <Button type="submit" colorScheme="green" px={8} fontWeight="bold">Review</Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
