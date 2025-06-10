import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step2Schema } from '../validation/schemas';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, SimpleGrid, FormErrorMessage,
  Text, Select as ChakraSelect
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";

// --- Constants (remain the same) ---
const DELIVERABLE_OPTIONS = [ { label: "Instagram Story", value: "Instagram Story" }, { label: "Instagram Post", value: "Instagram Post" }, { label: "TikTok Video", value: "TikTok Video" }, { label: "Autograph Signing", value: "Autograph Signing" }, { label: "Other", value: "Other" }];
const PAYMENT_STRUCTURES = [ { label: "Flat Fee", value: "Flat Fee" }, { label: "Revenue Share", value: "Revenue Share" }, { label: "Other", value: "Other" }];
const DEAL_CATEGORIES = [ { label: "Apparel", value: "Apparel" }, { label: "Sports Equipment", value: "Sports Equipment" }, { label: "Events", value: "Events" }, { label: "Other", value: "Other" }];
const DEAL_TYPES = [ { label: "Social Media", value: "Social Media" }, { label: "In-Person", value: "In-Person" }, { label: "Appearances", value: "Appearances" }, { label: "Other", value: "Other" }];
const creatableSelectStyles = { control: (base) => ({ ...base, background: "#2d3748", borderColor: "#4a5568", color: "white", "&:hover": { borderColor: "#63b3ed" }, }), multiValue: (base) => ({ ...base, backgroundColor: "#276749" }), multiValueLabel: (base) => ({ ...base, color: "white" }), multiValueRemove: (base) => ({ ...base, color: "#e2e8f0", "&:hover": { backgroundColor: "#c53030", color: "white" } }), input: (base) => ({ ...base, color: "white" }), menu: (base) => ({ ...base, background: "#1a202c", zIndex: 9999 }), option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? "#38a169" : state.isFocused ? "#2d3748" : "transparent", "&:active": { backgroundColor: "#276749" }, }), placeholder: (base) => ({ ...base, color: "#a0aec0" }), };

export default function FMVStep2({ onBack, onNext }) {
  const { formData, updateFormData } = useFMV();
  const { control, handleSubmit, formState: { errors }, watch, register } = useForm({
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
            <Heading fontSize="2xl" color="white">Social Following</Heading>
            <Text color="gray.400" mt="-4 !important">Enter your follower counts (optional).</Text>
            
            {/* FOLLOWER INPUTS ADDED HERE */}
            <SimpleGrid columns={2} spacing={4}>
                <FormControl isInvalid={!!errors.followers_instagram}>
                    <FormLabel color="gray.200">Instagram</FormLabel>
                    <Controller name="followers_instagram" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 10000" bg="gray.800" />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_instagram?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_tiktok}>
                    <FormLabel color="gray.200">TikTok</FormLabel>
                    <Controller name="followers_tiktok" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 5000" bg="gray.800" />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_tiktok?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_twitter}>
                    <FormLabel color="gray.200">X (Twitter)</FormLabel>
                    <Controller name="followers_twitter" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 2500" bg="gray.800" />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_twitter?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_youtube}>
                    <FormLabel color="gray.200">YouTube</FormLabel>
                    <Controller name="followers_youtube" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 1000" bg="gray.800" />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_youtube?.message}</FormErrorMessage>
                </FormControl>
            </SimpleGrid>

            <Heading fontSize="2xl" color="white" pt={4}>Deal Details</Heading>
            
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabel color="gray.200">Payment Structure</FormLabel>
              <ChakraSelect {...register("payment_structure")} bg="gray.800" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _focus={{ borderColor: "green.300", boxShadow: `0 0 0 1px #68D391`}}>
                <option value="" style={{ backgroundColor: "#1A202C" }}>Select...</option>
                {PAYMENT_STRUCTURES.map(opt => <option key={opt.value} value={opt.value} style={{ backgroundColor: "#1A202C" }}>{opt.label}</option>)}
              </ChakraSelect>
              <FormErrorMessage>{errors.payment_structure?.message}</FormErrorMessage>
            </FormControl>

            {paymentStructureValue === 'Other' && (
              <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
                <FormLabel color="gray.200">Please describe</FormLabel>
                <Input {...register("payment_structure_other")} placeholder="Describe payment structure" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }}/>
                <FormErrorMessage>{errors.payment_structure_other?.message}</FormErrorMessage>
              </FormControl>
            )}
            
            <FormControl isRequired isInvalid={!!errors.deal_length_months}>
                <FormLabel color="gray.200">Deal Length (months)</FormLabel>
                <Controller name="deal_length_months" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value || ''} min={1} max={48} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 6" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.deal_length_months?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
                <FormLabel color="gray.200">Total Proposed $</FormLabel>
                <Controller name="proposed_dollar_amount" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value || ''} min={0} precision={2} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 5000" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.proposed_dollar_amount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deal_category}>
              <FormLabel color="gray.200">Deal Category</FormLabel>
              <ChakraSelect {...register("deal_category")} bg="gray.800" borderColor="gray.600" _hover={{ borderColor: "gray.500" }} _focus={{ borderColor: "green.300", boxShadow: `0 0 0 1px #68D391`}}>
                <option value="" style={{ backgroundColor: "#1A202C" }}>Select...</option>
                {DEAL_CATEGORIES.map(opt => <option key={opt.value} value={opt.value} style={{ backgroundColor: "#1A202C" }}>{opt.label}</option>)}
              </ChakraSelect>
              <FormErrorMessage>{errors.deal_category?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.brand_partner}>
              <FormLabel color="gray.200">Brand Partner</FormLabel>
              <Input {...register("brand_partner")} placeholder="e.g., Nike, Adidas" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }}/>
              <FormErrorMessage>{errors.brand_partner?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deliverables}>
              <FormLabel color="gray.200">Deliverables</FormLabel>
              <Controller name="deliverables" control={control} render={({ field }) => (
                <CreatableSelect isMulti options={DELIVERABLE_OPTIONS}
                  value={field.value ? field.value.map(v => ({label: v, value: v})) : []}
                  onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                  placeholder="Choose or create…"
                  styles={creatableSelectStyles} />
              )}/>
               <FormErrorMessage>{errors.deliverables?.message}</FormErrorMessage>
            </FormControl>
            
            {deliverablesValue?.includes('Other') && (
                 <FormControl isRequired isInvalid={!!errors.deliverable_other}>
                    <FormLabel color="gray.200">Describe Other Deliverable</FormLabel>
                    <Input {...register("deliverable_other")} placeholder="Describe the other deliverable" bg="gray.800" _hover={{ borderColor: "gray.600" }} _focus={{ borderColor: "green.300", boxShadow: "0 0 0 1px #68D391" }}/>
                    <FormErrorMessage>{errors.deliverable_other?.message}</FormErrorMessage>
                </FormControl>
            )}
            
            <FormControl>
                <FormLabel color="gray.200">Deal Types (optional)</FormLabel>
                <Controller name="deal_type" control={control} render={({field}) => (
                    <CreatableSelect isMulti options={DEAL_TYPES}
                        value={field.value ? field.value.map(v => ({label: v, value: v})) : []}
                        onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                        placeholder="Choose or create…"
                        styles={creatableSelectStyles}
                    />
                )} />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.is_real_submission}>
                <FormLabel color="gray.200">Is this a real submission?</FormLabel>
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
            <Button onClick={onBack} colorScheme="green" variant="outline" _hover={{ bg: "#23272f", color: "#88E788", borderColor: "#88E788" }}>Back</Button>
            <Button type="submit" colorScheme="green" px={8} fontWeight="bold">Review</Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
