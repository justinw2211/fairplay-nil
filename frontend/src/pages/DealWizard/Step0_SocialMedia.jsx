import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronRight, Clock, Users } from 'lucide-react';
import SocialMediaForm from '../../components/forms/social-media-form';
import useSocialMedia from '../../hooks/use-social-media';

const Step0_SocialMedia = () => {
  // PATTERN: Follow Step1_DealTerms.jsx structure exactly (cursor rule)
  const { dealId } = useParams();
  const { deal, updateDeal } = useDeal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { fetchSocialMedia, updateSocialMedia } = useSocialMedia();

  // CRITICAL: Load existing social media data on mount
  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        const data = await fetchSocialMedia();
        setSocialMediaData(data || []);
              } catch (error) {
            // Log error without sensitive data
            toast({
          title: 'Notice',
          description: 'Could not load existing social media data. You can still add your information.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (user) {
      loadSocialMedia();
    } else {
      setInitialLoading(false);
    }
  }, [user, fetchSocialMedia, toast]);

  const handleNext = async (formData) => {
    setLoading(true);
    try {
      // Update social media data first
      await updateSocialMedia(formData);
      
      // CRITICAL: Update deal with current social media data (cursor rule)
      await updateDeal(dealId, { 
        athlete_social_media: formData.platforms,
        social_media_confirmed: true
        // Note: social_media_confirmed_at will be set by database trigger or default
      });
      
      toast({
        title: 'Social media confirmed',
        description: 'Your social media information has been updated and confirmed for this deal.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // PATTERN: Navigate to next step (maintain existing URLs)
      navigate(`/add/deal/terms/${dealId}`);
            } catch (error) {
            // Log error without sensitive data
            toast({
        title: 'Error updating deal',
        description: error.message || 'Failed to confirm social media information. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishLater = () => {
    navigate('/dashboard');
  };

  if (initialLoading) {
    return (
      <Container maxW="2xl" py={6}>
        <Flex justify="center" align="center" minH="300px">
          <VStack spacing={4}>
            <Icon as={Users} boxSize={12} color="brand.accentPrimary" />
            <Text color="brand.textSecondary">Loading your social media information...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  // CRITICAL: Maintain existing UI patterns (cursor rule)
  return (
    <Container maxW="2xl" py={6}>
      <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
        <CardHeader pb={6}>
          {/* Progress Indicator - Updated for new step */}
          <VStack spacing={3} mb={6}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="medium">Step 1 of 9</Text>
              <Text color="brand.textSecondary">11.1% Complete</Text>
            </Flex>
            <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
              <Box
                bg="brand.accentPrimary"
                h="2"
                w="11.1%"
                rounded="full"
                transition="width 0.5s ease-out"
              />
            </Box>
          </VStack>

          {/* Header */}
          <VStack spacing={3} align="start">
            <Heading size="lg" color="brand.textPrimary">Confirm Social Media</Heading>
            <Text color="brand.textSecondary" fontSize="lg">
              Please confirm your current social media information. This data will be used for NIL compliance and deal valuation.
            </Text>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={6}>
            {/* NIL Compliance Notice */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="semibold" color="brand.textPrimary">
                  Why we need this information
                </Text>
                <Text fontSize="sm" color="brand.textSecondary">
                  Your social media follower counts are required for NCAA compliance reporting and help determine deal value. 
                  This information will be attached to your NIL deal for transparency and regulatory purposes.
                </Text>
              </VStack>
            </Alert>

            {/* Social Media Form */}
            <SocialMediaForm
              initialData={socialMediaData}
              onSubmit={handleNext}
              isLoading={loading}
            />

            {/* Navigation Buttons */}
            <Flex justify="space-between" pt={8} w="full">
              <Button
                leftIcon={<Icon as={Clock} />}
                variant="ghost"
                color="brand.textSecondary"
                px={8}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="semibold"
                onClick={handleFinishLater}
                isDisabled={loading}
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Finish Later
              </Button>
              <Button
                rightIcon={<Icon as={ChevronRight} />}
                bg="brand.accentPrimary"
                color="white"
                px={8}
                py={3}
                h={12}
                fontSize="base"
                fontWeight="semibold"
                transition="all 0.2s"
                _hover={{
                  transform: "scale(1.05)",
                  bg: "brand.accentPrimary",
                  shadow: "xl",
                }}
                isLoading={loading}
                loadingText="Saving..."
                onClick={() => document.getElementById('social-media-form').requestSubmit()}
              >
                Confirm & Continue
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Step0_SocialMedia; 