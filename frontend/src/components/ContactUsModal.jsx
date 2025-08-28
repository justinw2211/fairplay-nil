import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import FormField from './forms/FormField';
import PhoneField from './forms/PhoneField';

/**
 * Reusable Contact Us modal
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => Promise<void> | void
 */
const ContactUsModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      message: ''
    },
    mode: 'onBlur'
  });

  const submitHandler = async (data) => {
    try {
      await Promise.resolve(onSubmit?.(data));
      reset();
      onClose?.();
    } catch (_) {
      // swallow for now
    }
  };

  const closeHandler = () => onClose?.();

  return (
    <Modal isOpen={isOpen} onClose={closeHandler} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contact Us</ModalHeader>
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
              placeholder="name@company.com"
              type="email"
              isRequired
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                  message: 'Enter a valid email address'
                }
              }}
            />

            <PhoneField
              name="phone"
              control={control}
              label="Phone (optional)"
              placeholder="(555) 555-5555"
              isRequired={false}
            />

            <FormField
              name="message"
              control={control}
              label="Message (optional)"
              placeholder="How can we help?"
              type="textarea"
              maxLength={1000}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={closeHandler} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submitHandler)} isLoading={isSubmitting}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContactUsModal;
