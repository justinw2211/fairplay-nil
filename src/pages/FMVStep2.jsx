import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFMV } from "../context/FMVContext";
import { step2Schema } from '../validation/schemas';
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, NumberInput, NumberInputField, SimpleGrid, FormErrorMessage,
  Text, Select as ChakraSelect
} from "@chakra-ui/react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";


// --- Expanded Constants ---
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

const DELIVERABLE_OPTIONS = [ { label: "Instagram Story", value: "Instagram Story" }, { label: "Instagram Post", value: "Instagram Post" }, { label: "TikTok Video", value: "TikTok Video" }, { label: "Autograph Signing", value: "Autograph Signing" }, { label: "Other", value: "Other" }];
const DEAL_TYPES = [ { label: "Social Media", value: "Social Media" }, { label: "In-Person", value: "In-Person" }, { label: "Appearances", value: "Appearances" }, { label: "Other", value: "Other" }];

// --- Reusable style objects for react-select components ---
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


export default function FMVStep2({ onBack, onNext }) {
  const { formData, updateFormData } = useFMV();
  const { control, handleSubmit, formState: { errors }, watch, register, setValue } = useForm({
    resolver: yupResolver(step2Schema),
    defaultValues: formData,
  });

  const paymentStructureValue = watch('payment_structure');
  const deliverablesValue = watch('deliverables');
  const selectedPlatforms = watch('social_platforms', []);

  // Effect to clean up follower data if a platform is deselected
  useEffect(() => {
    const platformFollowerMap = {
      'Instagram': 'followers_instagram',
      'TikTok': 'followers_tiktok',
      'X (Twitter)': 'followers_twitter',
      'YouTube': 'followers_youtube'
    };
    // Get all platforms that *were* available but are not currently selected
    const deselectedPlatforms = Object.keys(platformFollowerMap).filter(p => !selectedPlatforms.includes(p));
    // Reset the value for each deselected platform
    deselectedPlatforms.forEach(platform => {
        setValue(platformFollowerMap[platform], "");
    });
  }, [selectedPlatforms, setValue]);


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
          <Progress value={100} size="md" />
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6}>
            <Heading fontSize="2xl" color="#282f3d">Social Following</Heading>
            
            <FormControl isInvalid={!!errors.social_platforms}>
                <FormLabel color="#4e6a7b">Which social media platforms do you use?</FormLabel>
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
                    {selectedPlatforms.includes('Instagram') && (
                        <FormControl isInvalid={!!errors.followers_instagram}>
                            <FormLabel color="#4e6a7b">Instagram Followers</FormLabel>
                            <Controller name="followers_instagram" control={control} render={({field}) => (
                                <NumberInput {...field} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                                    <NumberInputField placeholder="e.g., 10000" {...inputStyles} />
                                </NumberInput>
                            )} />
                            <FormErrorMessage>{errors.followers_instagram?.message}</FormErrorMessage>
                        </FormControl>
                    )}
                    {selectedPlatforms.includes('TikTok') && (
                        <FormControl isInvalid={!!errors.followers_tiktok}>
                            <FormLabel color="#4e6a7b">TikTok Followers</FormLabel>
                            <Controller name="followers_tiktok" control={control} render={({field}) => (
                                <NumberInput {...field} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                                    <NumberInputField placeholder="e.g., 5000" {...inputStyles} />
                                </NumberInput>
                            )} />
                            <FormErrorMessage>{errors.followers_tiktok?.message}</FormErrorMessage>
                        </FormControl>
                    )}
                    {selectedPlatforms.includes('X (Twitter)') && (
                       <FormControl isInvalid={!!errors.followers_twitter}>
                            <FormLabel color="#4e6a7b">X (Twitter) Followers</FormLabel>
                            <Controller name="followers_twitter" control={control} render={({field}) => (
                                <NumberInput {...field} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                                    <NumberInputField placeholder="e.g., 2500" {...inputStyles} />
                                </NumberInput>
                            )} />
                            <FormErrorMessage>{errors.followers_twitter?.message}</FormErrorMessage>
                        </FormControl>
                    )}
                    {selectedPlatforms.includes('YouTube') && (
                        <FormControl isInvalid={!!errors.followers_youtube}>
                            <FormLabel color="#4e6a7b">YouTube Subscribers</FormLabel>
                            <Controller name="followers_youtube" control={control} render={({field}) => (
                                <NumberInput {...field} min={0} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                                    <NumberInputField placeholder="e.g., 1000" {...inputStyles} />
                                </NumberInput>
                            )} />
                            <FormErrorMessage>{errors.followers_youtube?.message}</FormErrorMessage>
                        </FormControl>
                    )}
                </SimpleGrid>
            )}

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
                    <NumberInput {...field} value={field.value ?? ''} min={1} max={48} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
                        <NumberInputField placeholder="e.g. 6" {...inputStyles}/>
                    </NumberInput>
                )} />
                <FormErrorMessage>{errors.deal_length_months?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.proposed_dollar_amount}>
                <FormLabel color="#4e6a7b">Total Proposed $</FormLabel>
                <Controller name="proposed_dollar_amount" control={control} render={({field}) => (
                    <NumberInput {...field} value={field.value ?? ''} min={0} precision={2} onChange={(val) => field.onChange(val === '' ? null : Number(val))}>
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
                  styles={selectStyles} />
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
      </Box>
    </Flex>
  );
}