// src/pages/FMVStep3.jsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step3Schema } from '../validation/schemas';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, SimpleGrid, FormErrorMessage,
  Text, useToast,
} from "@chakra-ui/react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { CheckSquare } from "react-feather";

// --- Constants ---
const SOCIAL_PLATFORMS = [
    { label: "Instagram", value: "Instagram" },
    { label: "TikTok", value: "TikTok" },
    { label: "X (Twitter)", value: "X (Twitter)" },
    { label: "YouTube", value: "YouTube" }
];

const PAYMENT_STRUCTURES = [
    { label: "Flat Fee", value: "Flat Fee" },
    { label: "Commission", value: "Commission" },
    { label: "Revenue Share", value: "Revenue Share" },
    { label: "Equity/Stock", value: "Equity/Stock" },
    { label: "Product Seeding", value: "Product Seeding" },
    { label: "Performance-Based", value: "Performance-Based" },
    { label: "Hybrid (e.g., Fee + Commission)", value: "Hybrid" },
    { label: "Other", value: "Other" },
];

const DEAL_CATEGORIES = [
    { label: "Apparel & Fashion", value: "Apparel & Fashion" },
    { label: "Automotive", value: "Automotive" },
    { label: "Beverages (Non-Alcoholic)", value: "Beverages (Non-Alcoholic)" },
    { label: "Camps & Clinics", value: "Camps & Clinics" },
    { label: "Collectibles & Memorabilia", value: "Collectibles & Memorabilia" },
    { label: "Consumer Packaged Goods (CPG)", value: "Consumer Packaged Goods (CPG)"},
    { label: "Electronics", value: "Electronics" },
    { label: "Events & Appearances", value: "Events & Appearances" },
    { label: "Financial Services", value: "Financial Services" },
    { label: "Food & Restaurants", value: "Food & Restaurants" },
    { label: "Gaming & eSports", value: "Gaming & eSports" },
    { label: "Health & Wellness", value: "Health & Wellness" },
    { label: "Home Goods", value: "Home Goods" },
    { label: "Media & Content Creation", value: "Media & Content Creation" },
    { label: "Sports Equipment", value: "Sports Equipment" },
    { label: "Supplements & Nutrition", value: "Supplements & Nutrition" },
    { label: "Technology & Apps", value: "Technology & Apps" },
    { label: "Travel & Hospitality", value: "Travel & Hospitality" },
    { label: "Other", value: "Other" },
];

const DELIVERABLE_OPTIONS = [
    { label: "None", value: "None" },
    { label: "Instagram Story (1 frame)", value: "Instagram Story (1 frame)" },
    { label: "Instagram Story (multi-frame)", value: "Instagram Story (multi-frame)" },
    { label: "Instagram Post (static)", value: "Instagram Post (static)" },
    { label: "Instagram Reel", value: "Instagram Reel" },
    { label: "TikTok Video", value: "TikTok Video" },
    { label: "X (Twitter) Post", value: "X (Twitter) Post" },
    { label: "YouTube Video (dedicated)", value: "YouTube Video (dedicated)" },
    { label: "YouTube Video (integrated)", value: "YouTube Video (integrated)" },
    { label: "Autograph Signing", value: "Autograph Signing" },
    { label: "Personal Appearance", value: "Personal Appearance" },
    { label: "Team-wide deal", value: "Team-wide deal" },
    { label: "Other", value: "Other" }
];

const DEAL_TYPES = [
    { label: "Social Media Endorsement", value: "Social Media Endorsement" },
    { label: "In-Person Appearance", value: "In-Person Appearance" },
    { label: "Digital Content Creation", value: "Digital Content Creation" },
    { label: "Traditional Advertising (TV, Print)", value: "Traditional Advertising (TV, Print)"},
    { label: "Licensing (Jerseys, etc.)", value: "Licensing (Jerseys, etc.)" },
    { label: "Camps or Clinics", value: "Camps or Clinics" },
    { label: "Other", value: "Other" }
];

const selectStyles = {
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


export default function FMVStep3({ onBack, onNext }) {
  const toast = useToast();
  const { formData, updateFormData, resetFormData } = useFMV();
  const { control, handleSubmit, formState: { errors }, watch, register, setValue, reset, unregister } = useForm({
    resolver: yupResolver(step3Schema),
    defaultValues: formData,
    context: { deliverables: formData.deliverables },
  });
  
  // THE FIX: This useEffect ensures the form stays in sync with the context data
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);


  const paymentStructureValue = watch('payment_structure', []);
  const deliverablesValue = watch('deliverables', []);
  const selectedPlatforms = watch('social_platforms', []);

  useEffect(() => {
    const platformFollowerMap = {
      'Instagram': 'followers_instagram',
      'TikTok': 'followers_tiktok',
      'X (Twitter)': 'followers_twitter',
      'YouTube': 'followers_youtube'
    };
    const deselectedPlatforms = Object.keys(platformFollowerMap).filter(p => !selectedPlatforms.includes(p));
    deselectedPlatforms.forEach(platform => {
        setValue(platformFollowerMap[platform], "");
    });
  }, [selectedPlatforms, setValue]);
  
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'deliverables') {
        const oldCounts = value.deliverables_count || {};
        const newCounts = {};
        for (const deliverable of value.deliverables) {
          if (oldCounts[deliverable]) {
            newCounts[deliverable] = oldCounts[deliverable];
          }
        }
        setValue('deliverables_count', newCounts);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);


  const onSubmit = (data) => {
    updateFormData(data);
    if (onNext) onNext();
  };

  const handleFormReset = () => {
    resetFormData();
    toast({
      title: "Form reset!",
      description: "You can start over from Step 1.",
      status: "info",
      duration: 2000,
      isClosable: true
    });
  };
  
  const inputStyles = {
    bg: "#ffffff",
    borderColor: "#d6dce4",
    color: "#282f3d",
    _hover: { borderColor: "#d0bdb5" },
    _focus: { borderColor: "#d0bdb5", boxShadow: "0 0 0 1px #d0bdb5" },
  };
  
  const FormLabelWithInstructions = ({ children }) => (
    <FormLabel color="#4e6a7b" display="flex" alignItems="center">
      <CheckSquare size={16} style={{ marginRight: '8px', flexShrink: 0 }} /> 
      {children}
      <Text as="span" color="brand.textSecondary" fontSize="sm" ml={2} fontWeight="normal">(Select all that apply)</Text>
    </FormLabel>
  );

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d" py={10}>
      <Box w={["95vw", "600px"]} bg="#ffffff" boxShadow="xl" borderRadius="xl" p={[4, 8]} mx="auto" border="1px solid #d6dce4">
        <Box mb={6}>
          <Text color="#4e6a7b" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">Step 3 of 3: Deal Details</Text>
          <Progress value={100} size="md" />
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            <Heading fontSize="2xl" color="#282f3d">Social Following</Heading>
            
            <FormControl isInvalid={!!errors.social_platforms}>
                <FormLabelWithInstructions>Which social media platforms do you use?</FormLabelWithInstructions>
                <Controller
                    name="social_platforms"
                    control={control}
                    render={({ field }) => (
                        <Select
                            isMulti
                            options={SOCIAL_PLATFORMS}
                            value={SOCIAL_PLATFORMS.filter(opt => field.value?.includes(opt.value))}
                            onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                            placeholder="Select your platforms..."
                            styles={selectStyles}
                        />
                    )}
                />
                <FormErrorMessage>{errors.social_platforms?.message}</FormErrorMessage>
            </FormControl>
            
            {selectedPlatforms.length > 0 && (
                <SimpleGrid columns={2} spacing={4}>
                    {selectedPlatforms.map(platform => {
                        const fieldName = `followers_${platform.toLowerCase().replace(' (twitter)', '_twitter')}`;
                        const label = `${platform} Followers`;
                        return (
                            <FormControl key={platform} isInvalid={!!errors[fieldName]}>
                                <FormLabel color="#4e6a7b">{label}</FormLabel>
                                <Controller name={fieldName} control={control} render={({field}) => (
                                    <NumberInput {...field} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                                        <NumberInputField placeholder="e.g., 10000" {...inputStyles} />
                                    </NumberInput>
                                )} />
                                <FormErrorMessage>{errors[fieldName]?.message}</FormErrorMessage>
                            </FormControl>
                        )
                    })}
                </SimpleGrid>
            )}

            <Heading fontSize="2xl" color="#282f3d" pt={4}>Deal Details</Heading>
            
            <FormControl isRequired isInvalid={!!errors.payment_structure}>
              <FormLabelWithInstructions>Payment Structure</FormLabelWithInstructions>
               <Controller
                name="payment_structure"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={PAYMENT_STRUCTURES}
                    value={PAYMENT_STRUCTURES.filter(opt => field.value?.includes(opt.value))}
                    onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                    placeholder="Select one or more..."
                    styles={selectStyles}
                  />
                )}
              />
              <FormErrorMessage>{errors.payment_structure?.message}</FormErrorMessage>
            </FormControl>

            {paymentStructureValue.includes('Other') && (
              <FormControl isRequired isInvalid={!!errors.payment_structure_other}>
                <FormLabel color="#4e6a7b">Please describe</FormLabel>
                <Input {...register("payment_structure_other")} placeholder="Describe other payment structure" {...inputStyles}/>
                <FormErrorMessage>{errors.payment_structure_other?.message}</FormErrorMessage>
              </FormControl>
            )}
            
            <FormControl isRequired isInvalid={!!errors.deal_length_months}>
                <FormLabel color="#4e6a7b">Deal Length (months)</FormLabel>
                <Controller name="deal_length_months" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value ?? ''} min={1} max={48} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 6" {...inputStyles}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.deal_length_months?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
                <FormLabel color="#4e6a7b">Total Deal Compensation (Financial & In-Kind)</FormLabel>
                <Controller name="proposed_dollar_amount" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value ?? ''} min={0} precision={2} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 5000" {...inputStyles}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.proposed_dollar_amount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.deal_category}>
              <FormLabelWithInstructions>Industry of Compensating Entity</FormLabelWithInstructions>
              <Controller
                name="deal_category"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={DEAL_CATEGORIES}
                    value={DEAL_CATEGORIES.filter(opt => field.value?.includes(opt.value))}
                    onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                    placeholder="Select one or more..."
                    styles={selectStyles}
                  />
                )}
              />
              <FormErrorMessage>{errors.deal_category?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.brand_partner}>
              <FormLabel color="#4e6a7b">Compensating Brand or Entity</FormLabel>
              <Input {...register("brand_partner")} placeholder="e.g., Nike, Local Dealership, etc." {...inputStyles}/>
              <FormErrorMessage>{errors.brand_partner?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.deliverables}>
              <FormLabelWithInstructions>Deliverables</FormLabelWithInstructions>
              <Controller
                name="deliverables"
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    isMulti
                    options={DELIVERABLE_OPTIONS}
                    value={field.value ? field.value.map(v => ({label: v, value: v})) : []}
                    onChange={(options) => {
                        let values = options?.map(o => o.value) || [];
                        if (values.includes('None') && values.length > 1) {
                            values = ['None'];
                        }
                        field.onChange(values);
                    }}
                    placeholder="Choose or create..."
                    styles={selectStyles}
                  />
                )}
              />
               <FormErrorMessage>{errors.deliverables?.message}</FormErrorMessage>
            </FormControl>
            
            {deliverablesValue && !deliverablesValue.includes("None") && deliverablesValue.length > 0 && (
              <SimpleGrid columns={2} spacing={4} p={4} bg="brand.backgroundLight" borderRadius="md">
                {deliverablesValue.map(deliverable => {
                  if (deliverable === 'Other') return null;
                  const fieldName = `deliverables_count.${deliverable}`;
                  return (
                    <FormControl key={deliverable} isRequired isInvalid={errors.deliverables_count?.[deliverable]}>
                      <FormLabel color="#4e6a7b" fontSize="sm">{deliverable} Quantity</FormLabel>
                      <Controller
                        name={fieldName}
                        control={control}
                        render={({ field }) => (
                          <NumberInput {...field} min={1} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                            <NumberInputField placeholder="e.g., 3" {...inputStyles} />
                          </NumberInput>
                        )}
                      />
                      <FormErrorMessage>{errors.deliverables_count?.[deliverable]?.message}</FormErrorMessage>
                    </FormControl>
                  )
                })}
              </SimpleGrid>
            )}

            {deliverablesValue.includes('Other') && (
                 <FormControl isRequired isInvalid={!!errors.deliverable_other}>
                    <FormLabel color="#4e6a7b">Describe Other Deliverable</FormLabel>
                    <Input {...register("deliverable_other")} placeholder="Describe the other deliverable" {...inputStyles}/>
                    <FormErrorMessage>{errors.deliverable_other?.message}</FormErrorMessage>
                </FormControl>
            )}
            
            <FormControl>
                <FormLabelWithInstructions>Deal Types (optional)</FormLabelWithInstructions>
                <Controller name="deal_type" control={control} render={({field}) => (
                    <CreatableSelect isMulti options={DEAL_TYPES}
                        value={field.value ? field.value.map(v => ({label: v, value: v})) : []}
                        onChange={(options) => field.onChange(options?.map(o => o.value) || [])}
                        placeholder="Choose or create…"
                        styles={selectStyles}
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
                        >
                          Yes
                        </Button>
                         <Button
                          variant={field.value === 'no' ? 'solid' : 'outline'}
                          onClick={() => field.onChange('no')}
                          colorScheme="gray"
                        >
                          No (Test/Demo)
                        </Button>
                    </Flex>
                )} />
                <FormErrorMessage>{errors.is_real_submission?.message}</FormErrorMessage>
            </FormControl>

          </Stack>
          <Flex mt={8} justify="space-between">
            <Button onClick={onBack} variant="outline">Back</Button>
            <Button type="submit" px={8} fontWeight="bold">Review</Button>
          </Flex>
        </form>

        <Flex mt={3} justify="space-between" align="center">
          <Button size="sm" variant="ghost" color="#4e6a7b" onClick={handleFormReset}>Reset Form</Button>
          <Button size="sm" variant="ghost" color="#4e6a7b" onClick={() => {
              toast({
                title: "Resume link copied!",
                status: "success",
                duration: 1500,
                isClosable: true
              });
              navigator.clipboard.writeText(window.location.href);
            }}>Save Progress</Button>
        </Flex>

      </Box>
    </Flex>
  );
}