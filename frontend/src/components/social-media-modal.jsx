import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Box,
  Icon,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import SocialMediaForm from './forms/social-media-form';
import { useAuth } from '../context/AuthContext';
import useSocialMedia from '../hooks/use-social-media';

const SocialMediaModal = ({
  isOpen,
  onClose,
  onComplete = null,
  onSkip = null,
  title = "Complete Your Profile",
  subtitle = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const { updateSocialMedia } = useSocialMedia();
  const toast = useToast();

  const handleSubmit = async (socialMediaData) => {
    setIsLoading(true);
    try {
      // Use the hook's updateSocialMedia function instead of direct API call
      const savedData = await updateSocialMedia(socialMediaData);

      // Update user profile with completion status
      if (updateUserProfile) {
        await updateUserProfile({
          social_media_completed: true,
          social_media_completed_at: new Date().toISOString(),
        });
      }

      // Call completion callback if provided
      if (onComplete) {
        onComplete(savedData);
      }

      // Close modal
      onClose();

      toast({
        title: 'Profile completed!',
        description: 'Your social media information has been saved successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error saving social media:', error);
      toast({
        title: 'Error saving profile',
        description: error.message || 'Failed to save your social media information. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error; // Re-throw so the form can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Call skip callback if provided
    if (onSkip) {
      onSkip();
    }

    // Close modal
    onClose();

    toast({
      title: 'Profile setup skipped',
      description: 'You can complete your social media profile later in your account settings.',
      status: 'info',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl" 
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxW="600px" mx={4}>
        <ModalHeader pb={2}>
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold" color="brand.textPrimary">
              {title}
            </Text>
            <Text fontSize="md" color="brand.textSecondary" fontWeight="normal">
              {subtitle}
            </Text>
          </VStack>
        </ModalHeader>
        
        <ModalCloseButton />
        
                 <ModalBody pb={6}>
           <VStack spacing={6}>
             {/* Visual Element */}
             <Box
               p={6}
               bg="brand.backgroundLight"
               borderRadius="xl"
               w="full"
               textAlign="center"
             >
               <Box display="flex" justifyContent="center" gap={4}>
                 <Icon as={FiInstagram} boxSize={8} color="brand.accentPrimary" />
                 <Icon as={FiTwitter} boxSize={8} color="brand.accentPrimary" />
                 <Icon as={FiYoutube} boxSize={8} color="brand.accentPrimary" />
               </Box>
             </Box>

             {/* Social Media Form */}
             <SocialMediaForm
               onSubmit={handleSubmit}
               isLoading={isLoading}
             />
             
             {/* Action Buttons */}
             <VStack spacing={4} w="full" pt={4}>
               <Button
                 bg="brand.accentPrimary"
                 color="white"
                 w="full"
                 py={3}
                 fontSize="md"
                 fontWeight="semibold"
                 isLoading={isLoading}
                 loadingText="Saving..."
                 _hover={{
                   bg: "brand.accentPrimaryHover",
                   transform: "scale(1.02)",
                 }}
                 onClick={() => document.getElementById('social-media-form').requestSubmit()}
               >
                 Complete Profile
               </Button>
               
               <Button
                 variant="ghost"
                 color="brand.textSecondary"
                 onClick={handleSkip}
                 isDisabled={isLoading}
                 _hover={{
                   bg: "brand.backgroundLight",
                   color: "brand.textPrimary",
                 }}
               >
                 Skip for now
               </Button>
             </VStack>
           </VStack>
         </ModalBody>
       </ModalContent>
     </Modal>
   );
 };

export default SocialMediaModal; 