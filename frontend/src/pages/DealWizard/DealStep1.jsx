// frontend/src/pages/DealWizard/DealStep1.jsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useFMVContext } from '../../context/FMVContext';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  Select,
  Textarea,
  Collapse,
  useDisclosure,
  Box,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { industryOptions } from '../../data/formConstants'; // Assuming you have this

// Validation Schema for Step 1
const schema = yup.object().shape({
  payor_name: yup.string().required('Payor name is required.'),
  payor_industry: yup.string().required('Payor industry is required.'),
  deal_description: yup.string().required('A brief deal description is required.').max(200, 'Description must be 200 characters or less.'),
  has_relationship: yup.string().required('Please specify if a relationship exists.'),
  payor_relationship_details: yup.string().when('has_relationship', {
    is: 'yes',
    then: (schema) => schema.required('Please describe the relationship.'),
    otherwise: (schema) => schema.optional(),
  }),
});


const DealStep1 = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFMVContext();
  const { isOpen, onToggle } = useDisclosure({
    defaultIsOpen: formData.has_relationship === 'yes'
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      payor_name: formData.payor_name || '',
      payor_industry: formData.payor_industry || '',
      deal_description: formData.deal_description || '',
      has_relationship: formData.has_relationship || '',
      payor_relationship_details: formData.payor_relationship_details || ''
    }
  });

  const hasRelationship = watch('has_relationship');

  // Effect to toggle the collapse when the relationship question changes
  // This is a more robust way to handle the conditional UI
  let firstRender = true;
  React.useEffect(() => {
    if(!firstRender && hasRelationship === 'yes'){
        if(!isOpen) onToggle();
    } else if (!firstRender && hasRelationship === 'no'){
        if(isOpen) onToggle();
    }
    firstRender = false;
  }, [hasRelationship, isOpen, onToggle]);


  const onSubmit = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    // navigate('/dashboard/new-deal/step-2'); // We will enable this in the next chunk
    navigate('/dashboard/new-deal/step-2'); // This is now enabled.
  };
// ... rest of the file

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="md" color="brand.textPrimary">
          Step 1: The Basics
        </Heading>
        <Text color="brand.textSecondary">
          Tell us about the person or company (the payor) and the nature of the deal.
        </Text>

        <Controller
          name="payor_name"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.payor_name}>
              <FormLabel color="brand.textPrimary">Payor Name</FormLabel>
              <Input {...field} placeholder="e.g., Main Street Car Wash" />
              <FormErrorMessage>{errors.payor_name?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        <Controller
          name="payor_industry"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.payor_industry}>
              <FormLabel color="brand.textPrimary">Payor Industry</FormLabel>
              <Select {...field} placeholder="Select industry">
                {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Select>
              <FormErrorMessage>{errors.payor_industry?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        
        <Controller
          name="deal_description"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.deal_description}>
              <FormLabel color="brand.textPrimary">Deal Description</FormLabel>
              <Textarea {...field} placeholder="e.g., 'Post 3 times on Instagram promoting their business.'" />
              <FormErrorMessage>{errors.deal_description?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        
        <Controller
          name="has_relationship"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={errors.has_relationship}>
              <FormLabel color="brand.textPrimary">Do you or your family have a pre-existing relationship with the payor (e.g., booster, family friend)?</FormLabel>
              <Select {...field} placeholder="Select an option">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
              <FormErrorMessage>{errors.has_relationship?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        <Collapse in={hasRelationship === 'yes'} animateOpacity>
           <Controller
            name="payor_relationship_details"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={errors.payor_relationship_details} mt={4}>
                <FormLabel color="brand.textPrimary">Please describe the relationship</FormLabel>
                <Textarea {...field} placeholder="e.g., 'The owner is a long-time family friend and university booster.'" />
                <FormErrorMessage>{errors.payor_relationship_details?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Collapse>

        <Flex>
            <Spacer />
            <Button
                mt={4}
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                isLoading={isSubmitting}
                type="submit"
                _hover={{ bg: '#c8aeb0' }}
            >
                Next: Compensation
            </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default DealStep1;