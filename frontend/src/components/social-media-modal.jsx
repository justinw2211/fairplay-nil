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
  useToast,
} from '@chakra-ui/react';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import SocialMediaForm from './forms/social-media-form';
import { useAuth } from '../context/AuthContext';

const SocialMediaModal = ({
  isOpen,
  onClose,
  onComplete = null,
  onSkip = null,
  title = "Complete Your Profile",
  subtitle = "Add your social media accounts to help brands discover you for NIL opportunities"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();

  const handleSubmit = async (socialMediaData) => {
    setIsLoading(true);
    try {
      // Make API call to save social media data
      const response = await fetch('/api/profile/social-media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.session?.access_token}`,
        },
        body: JSON.stringify(socialMediaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save social media information');
      }

      const savedData = await response.json();

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
               <VStack spacing={4}>
                 <Box>
                   <Text fontSize="sm" color="brand.textSecondary" mb={3}>
                     Connect your social platforms
                   </Text>
                   <Box display="flex" justifyContent="center" gap={4}>
                     <Icon as={FiInstagram} boxSize={8} color="brand.accentPrimary" />
                     <Icon as={FiTwitter} boxSize={8} color="brand.accentPrimary" />
                     <Icon as={FiYoutube} boxSize={8} color="brand.accentPrimary" />
                   </Box>
                 </Box>
                 <VStack spacing={2}>
                   <Text fontSize="md" fontWeight="semibold" color="brand.textPrimary">
                     Why add social media?
                   </Text>
                   <VStack spacing={1} align="start" w="full">
                     <Text fontSize="sm" color="brand.textSecondary">
                       • Brands can find you for NIL deals based on your reach
                     </Text>
                     <Text fontSize="sm" color="brand.textSecondary">
                       • Higher follower counts may lead to better deal offers
                     </Text>
                     <Text fontSize="sm" color="brand.textSecondary">
                       • Required for compliance reporting and deal validation
                     </Text>
                   </VStack>
                 </VStack>
               </VStack>
             </Box>

             {/* Social Media Form */}
             <SocialMediaForm
               onSubmit={handleSubmit}
               isLoading={isLoading}
               showSkip={true}
               onSkip={handleSkip}
               submitButtonText="Complete Profile"
             />
           </VStack>
         </ModalBody>
       </ModalContent>
     </Modal>
   );
 };

export default SocialMediaModal; 