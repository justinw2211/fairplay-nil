// frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';

// Validation schema
const platformSchema = yup.object().shape({
  platform: yup.string().required('Platform is required.'),
  quantity: yup
    .number()
    .typeError('Must be a number')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required.'),
});

const schema = yup.object().shape({
  platforms: yup
    .array()
    .of(platformSchema)
    .min(1, 'Please add at least one social media deliverable.'),
});

const ActivityForm_SocialMedia = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: { platforms: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'platforms',
  });

  // Preload or append at least one row
  useEffect(() => {
    const existing = deal?.obligations?.['Social Media'];
    if (existing && existing.length > 0) {
      reset({ platforms: existing });
    } else if (fields.length === 0) {
      append({ platform: '', quantity: 1 });
    }
  }, [deal, reset, append, fields.length]);

  const onContinue = async (formData) => {
    const newObligations = {
      ...deal.obligations,
      'Social Media': formData.platforms,
    };
    await updateDeal(dealId, { obligations: newObligations });
    navigate(nextStepUrl);
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
                <FormControl isInvalid={!!errors.platforms?.[index]?.platform}>
                  <FormLabel>Platform</FormLabel>
                  <Select {...field} placeholder="Select Platform">
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="X">X (Twitter)</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                  </Select>
                  {errors.platforms?.[index]?.platform && (
                    <Text color="red.500" fontSize="sm">
                      {errors.platforms[index].platform.message}
                    </Text>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name={`platforms.${index}.quantity`}
              control={control}
              render={({ field }) => (
                <FormControl isInvalid={!!errors.platforms?.[index]?.quantity}>
                  <FormLabel>Quantity</FormLabel>
                  <Input {...field} type="number" />
                  {errors.platforms?.[index]?.quantity && (
                    <Text color="red.500" fontSize="sm">
                      {errors.platforms[index].quantity.message}
                    </Text>
                  )}
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

        {errors.platforms && typeof errors.platforms.message === 'string' && (
          <Text color="red.500" fontSize="sm">
            {errors.platforms.message}
          </Text>
        )}

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
