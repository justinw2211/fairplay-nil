import React, { useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { createLogger } from '../utils/logger';
import FormField from './forms/FormField';
import SchoolField from './forms/SchoolField';

const logger = createLogger('UniversitiesDemoModal');

/**
 * Universities demo request modal (must-have fields only)
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => Promise<void> | void
 */
export default function UniversitiesDemoModal({ isOpen, onClose, onSubmit }) {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      university: '',
      message: '',
    },
    mode: 'onBlur',
  });

  const initialRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      logger.info('Universities modal open', { action: 'modal_open' });
    }
  }, [isOpen]);

  const submitHandler = async (data) => {
    try {
      logger.info('Universities modal submit');
      await Promise.resolve(onSubmit?.(data));
      reset();
      onClose?.();
    } catch (e) {
      logger.error('Universities modal submit error', { error: String(e?.message || e) });
    }
  };

  const closeHandler = () => {
    logger.info('Universities modal close', { reason: 'user' });
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeHandler} initialFocusRef={initialRef} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Schedule a Demo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormField
              name="fullName"
              control={control}
              label="Full Name"
              placeholder="Your full name"
              isRequired
              rules={{ required: 'Full name is required' }}
            />

            <FormField
              name="email"
              control={control}
              label="Work Email"
              placeholder="name@university.edu"
              type="email"
              isRequired
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                  message: 'Enter a valid email address',
                },
              }}
            />

            <SchoolField
              name="university"
              control={control}
              label="University"
              placeholder="Select your university"
              isRequired
            />

            <FormField
              name="message"
              control={control}
              label="Message"
              placeholder="Tell us about your goals or questions"
              type="textarea"
              isRequired
              maxLength={1000}
              rules={{ required: 'Message is required' }}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={closeHandler} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submitHandler)} isLoading={isSubmitting}>
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
