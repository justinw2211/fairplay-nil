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

const DELIVERABLE_OPTIONS = [ { label: "Instagram Story", value: "Instagram Story" }, { label: "Instagram Post", value: "Instagram Post" }, { label: "TikTok Video", value: "TikTok Video" }, { label: "Autograph Signing", value: "Autograph Signing" }, { label: "Other", value: "Other" }];
const PAYMENT_STRUCTURES = [ { label: "Flat Fee", value: "Flat Fee" }, { label: "Revenue Share", value: "Revenue Share" }, { label: "Other", value: "Other" }];
const DEAL_CATEGORIES = [ { label: "Apparel", value: "Apparel" }, { label: "Sports Equipment", value: "Sports Equipment" }, { label: "Events", value: "Events" }, { label: "Other", value: "Other" }];
const DEAL_TYPES = [ { label: "Social Media", value: "Social Media" }, { label: "In-Person", value: "In-Person" }, { label: "Appearances", value: "Appearances" }, { label: "Other", value: "Other" }];

const creatableSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: "#ffffff",
    borderColor: state.isFocused ? "#d0bdb5" : "#d6dce4",
    color: "#282f3d",
    boxShadow: state.isFocused ? "0 0 0 1px #d0bdb5" : "none",
    "&:hover": {
      borderColor: "#d0bdb5",
    },
  }),
  multiValue: (base) => ({ ...base, backgroundColor: "#d6dce4" }),
  multiValueLabel: (base) => ({ ...base, color: "#282f3d" }),
  multiValueRemove: (base) => ({ ...base, color: "#282f3d", "&:hover": { backgroundColor: "#d0bdb5", color: "white" } }),
  input: (base) => ({ ...base, color: "#282f3d" }),
  menu: (base) => ({ ...base, background: "#ffffff", zIndex: 9999, border: "1px solid #d6dce4" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#d0bdb5" : state.isFocused ? "#f4f4f4" : "transparent",
    color: state.isSelected ? "#ffffff" : "#282f3d",
    "&:active": {
      backgroundColor: "#c9b2a9",
    },
  }),
  placeholder: (base) => ({ ...base, color: "#4e6a7b" }),
};


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
  
  const inputStyles = {
    bg: "#ffffff",
    borderColor: "#d6dce4",
    color: "#282f3d",
    _hover: { borderColor: "#d0bdb5" },
    _focus: { borderColor: "#d0bdb5", boxShadow: "0 0 0 1px #d0bdb5" },
  };
  
  const chakraSelectStyles = {
    bg: "#ffffff",
    borderColor: "#d6dce4",
    color: "#282f3d",
    _hover: { borderColor: "#d0bdb5" },
    _focus: { borderColor: "#d0bdb5", boxShadow: "0 0 0 1px #d0bdb5" },
    "& > option": {
        background: "#ffffff",
        color: "#282f3d",
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d" py={10}>
      <Box w={["95vw", "600px"]} bg="#ffffff" boxShadow="xl" borderRadius="xl" p={[4, 8]} mx="auto" border="1px solid #d6dce4">
        <Box mb={6}>
          <Text color="#4e6a7b" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">Step 2 of 2: Deal Details</Text>
          <Progress value={100} size="md" colorScheme="pink" sx={{ "& > div": { backgroundColor: "#d0bdb5" } }} borderRadius="full" mb={2} />
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            <Heading fontSize="2xl" color="#282f3d">Social Following</Heading>
            <Text color="#4e6a7b" mt="-4 !important">Enter your follower counts (optional).</Text>
            
            <SimpleGrid columns={2} spacing={4}>
                <FormControl isInvalid={!!errors.followers_instagram}>
                    <FormLabel color="#4e6a7b">Instagram</FormLabel>
                    <Controller name="followers_instagram" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 10000" {...inputStyles} />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_instagram?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_tiktok}>
                    <FormLabel color="#4e6a7b">TikTok</FormLabel>
                    <Controller name="followers_tiktok" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 5000" {...inputStyles} />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_tiktok?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_twitter}>
                    <FormLabel color="#4e6a7b">X (Twitter)</FormLabel>
                    <Controller name="followers_twitter" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 2500" {...inputStyles} />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_twitter?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.followers_youtube}>
                    <FormLabel color="#4e6a7b">YouTube</FormLabel>
                    <Controller name="followers_youtube" control={control} render={({field}) => (
                        <NumberInput {...field} value={field.value || ''} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 1000" {...inputStyles} />
                        </NumberInput>
                    )} />
                    <FormErrorMessage>{errors.followers_youtube?.message}</FormErrorMessage>
                </FormControl>
            </SimpleGrid>

            <Heading fontSize="2xl" color="#282f3d" pt={4}>Deal Details</Heading>
            
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabel color="#4e6a7b">Payment Structure</FormLabel>
              <ChakraSelect {...register("payment_structure")} {...chakraSelectStyles}>
                <option value="">Select...</option>
                {PAYMENT_STRUCTURES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </ChakraSelect>
              <FormErrorMessage>{errors.payment_structure?.message}</FormErrorMessage>
            </FormControl>

            {paymentStructureValue === 'Other' && (
              <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
                <FormLabel color="#4e6a7b">Please describe</FormLabel>
                <Input {...register("payment_structure_other")} placeholder="Describe payment structure" {...inputStyles}/>
                <FormErrorMessage>{errors.payment_structure_other?.message}</FormErrorMessage>
              </FormControl>
            )}
            
            <FormControl isRequired isInvalid={!!errors.deal_length_months}>
                <FormLabel color="#4e6a7b">Deal Length (months)</FormLabel>
                <Controller name="deal_length_months" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value || ''} min={1} max={48} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 6" {...inputStyles}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.deal_length_months?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
                <FormLabel color="#4e6a7b">Total Proposed $</FormLabel>
                <Controller name="proposed_dollar_amount" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value || ''} min={0} precision={2} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 5000" {...inputStyles}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.proposed_dollar_amount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deal_category}>
              <FormLabel color="#4e6a7b">Deal Category</FormLabel>
              <ChakraSelect {...register("deal_category")} {...chakraSelectStyles}>
                <option value="">Select...</option>
                {DEAL_CATEGORIES.map(opt => <option key={opt.value} value={opt.value} >{opt.label}</option>)}
              </ChakraSelect>
              <FormErrorMessage>{errors.deal_category?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.brand_partner}>
              <FormLabel color="#4e6a7b">Brand Partner</FormLabel>
              <Input {...register("brand_partner")} placeholder="e.g., Nike, Adidas" {...inputStyles}/>
              <FormErrorMessage>{errors.brand_partner?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deliverables}>
              <FormLabel color="#4e6a7b">Deliverables</FormLabel>
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
                    <FormLabel color="#4e6a7b">Describe Other Deliverable</FormLabel>
                    <Input {...register("deliverable_other")} placeholder="Describe the other deliverable" {...inputStyles}/>
                    <FormErrorMessage>{errors.deliverable_other?.message}</FormErrorMessage>
                </FormControl>
            )}
            
            <FormControl>
                <FormLabel color="#4e6a7b">Deal Types (optional)</FormLabel>
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
                <FormLabel color="#4e6a7b">Is this a real submission?</FormLabel>
                <Controller name="is_real_submission" control={control} render={({ field }) => (
                    <Flex gap={5}>
                        <Button
                          variant={field.value === 'yes' ? 'solid' : 'outline'}
                          onClick={() => field.onChange('yes')}
                          bg={field.value === 'yes' ? '#d0bdb5' : 'transparent'}
                          color={field.value === 'yes' ? '#ffffff' : '#4e6a7b'}
                          borderColor={field.value === 'yes' ? '#d0bdb5' : '#d6dce4'}
                          _hover={{ bg: field.value === 'yes' ? '#c9b2a9' : '#f4f4f4' }}
                        >
                          Yes
                        </Button>
                         <Button
                          variant={field.value === 'no' ? 'solid' : 'outline'}
                          onClick={() => field.onChange('no')}
                          bg={field.value === 'no' ? '#4e6a7b' : 'transparent'}
                          color={field.value === 'no' ? '#ffffff' : '#4e6a7b'}
                          borderColor={field.value === 'no' ? '#4e6a7b' : '#d6dce4'}
                           _hover={{ bg: field.value === 'no' ? '#435c6b' : '#f4f4f4' }}
                        >
                          No (Test/Demo)
                        </Button>
                    </Flex>
                )} />
                <FormErrorMessage>{errors.is_real_submission?.message}</FormErrorMessage>
            </FormControl>

          </Stack>
          <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline" borderColor="#d6dce4" color="#4e6a7b" _hover={{ bg: "#f4f4f4" }}>Back</Button>
            <Button type="submit" bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }} px={8} fontWeight="bold">Review</Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}