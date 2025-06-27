// frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormControl, FormLabel, Input, Select, Button, VStack, HStack, IconButton, Text } from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';

// Validation schema for a single platform entry
const platformSchema = yup.object().shape({
  platform: yup.string().required('Platform is required.'),
  quantity: yup.number().typeError('Must be a number').min(1, 'Quantity must be at least 1').required('Quantity is required.'),
});

// Main schema for the social media form
const schema = yup.object().shape({
  platforms: yup.array().of(platformSchema).min(1, 'Please add at least one social media deliverable.'),
});

const ActivityForm_SocialMedia = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { platforms: [] },
  });

  // 'useFieldArray' is a powerful custom hook from react-hook-form for dynamic fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "platforms",
  });

  // When deal data loads, populate the form with existing social media obligations
  useEffect(() => {
    if (deal?.obligations?.['Social Media']) {
      reset({ platforms: deal.obligations['Social Media'] });
    }
  }, [deal, reset]);

  const onContinue = async (formData) => {
    // We update the 'Social Media' key within the larger 'obligations' object
    const newObligations = { ...deal.obligations, "Social Media": formData.platforms };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl); // Navigate to the next step calculated by the router
  };

  return (
    <DealWizardLayout
      title="Social Media Deliverables"
      instructions="Specify the platforms and quantity for your social media posts."
      onContinue={handleSubmit(onContinue)}
      isContinueDisabled={!isValid}
    >
      <VStack as="form" spacing={6} onSubmit={handleSubmit(onContinue)}>
        {fields.map((item, index) => (
          <HStack key={item.id} spacing={4} w="full" align="flex-end">
            <Controller
              name={`platforms.${index}.platform`}
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>Platform</FormLabel>
                  <Select {...field} placeholder="Select Platform">
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="X">X (Twitter)</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name={`platforms.${index}.quantity`}
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={errors.platforms?.[index]?.quantity}>
                  <FormLabel>Quantity</FormLabel>
                  <Input {...field} type="number" />
                </FormControl>
              )}
            />
            <IconButton
              aria-label="Delete platform"
              icon={<DeleteIcon />}
              colorScheme="red"
              variant="ghost"
              onClick={() => remove(index)}
            />
          </HStack>
        ))}
        {errors.platforms && <Text color="red.500" fontSize="sm">{errors.platforms.message}</Text>}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => append({ platform: '', quantity: 1 })}
          alignSelf="flex-start"
        >
          Add Platform
        </Button>
      </VStack>
    </DealWizardLayout>
  );
};

export default ActivityForm_SocialMedia;