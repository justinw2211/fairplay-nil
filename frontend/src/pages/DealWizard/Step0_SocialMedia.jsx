import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import { createLogger } from '../../utils/logger';

const logger = createLogger('Step0_SocialMedia');

const Step0_SocialMedia = () => {
  // PATTERN: Follow Step1_DealTerms.jsx structure exactly (cursor rule)
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const { currentDeal, updateDeal } = useDeal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  console.log('[Step0_SocialMedia] ===== COMPONENT RENDERED =====');
  console.log('[Step0_SocialMedia] dealId:', dealId);
  console.log('[Step0_SocialMedia] dealType:', dealType);
  console.log('[Step0_SocialMedia] currentDeal:', currentDeal);
  console.log('[Step0_SocialMedia] user authenticated:', !!user);

  const [socialMediaData, setSocialMediaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Reference to trigger form submission
  const formRef = useRef(null);

  const { fetchSocialMedia, updateSocialMedia } = useSocialMedia();

  // CRITICAL: Load existing social media data on mount
  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        const data = await fetchSocialMedia();
        setSocialMediaData(data || []);
        logger.info('Social media data loaded successfully', {
          dealId,
          dealType,
          dataCount: data?.length || 0
        });
      } catch (error) {
        // Log error with context for debugging
        logger.error('Failed to load social media data', {
          error: error.message,
          dealId,
          dealType,
          userId: user?.id,
          step: 'Step0_SocialMedia',
          operation: 'loadSocialMedia'
        });

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

      // CRITICAL: Update deal with current social media data and deal type (cursor rule)
      await updateDeal(dealId, {
        athlete_social_media: formData.platforms,
        social_media_confirmed: true,
        deal_type: dealType
        // Note: social_media_confirmed_at will be set by database trigger or default
      });

      logger.info('Social media data updated successfully', {
        dealId,
        dealType,
        platformsCount: formData.platforms?.length || 0,
        step: 'Step0_SocialMedia',
        operation: 'handleNext'
      });

      toast({
        title: 'Social media confirmed',
        description: 'Your social media information has been updated and confirmed for this deal.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // PATTERN: Navigate to next step based on deal type (maintain existing URLs with type parameter)
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/terms/${dealId}${typeParam}`);
    } catch (error) {
      // Log error with context for debugging
      logger.error('Failed to update social media data', {
        error: error.message,
        dealId,
        dealType,
        userId: user?.id,
        step: 'Step0_SocialMedia',
        operation: 'handleNext',
        formDataKeys: Object.keys(formData || {})
      });

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
    logger.info('User chose to finish later', {
      dealId,
      dealType,
      userId: user?.id,
      step: 'Step0_SocialMedia',
      operation: 'handleFinishLater'
    });
    navigate('/dashboard');
  };

  const handleContinueClick = () => {
    try {
      // Try multiple approaches to trigger form submission
      if (formRef.current) {
        // First try: dispatch submit event
        const form = formRef.current.querySelector('#social-media-form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          return;
        }
      }

      // Fallback: click the hidden submit button
      const submitButton = document.querySelector('[data-testid="social-media-submit"]');
      if (submitButton) {
        submitButton.click();
      }

      logger.info('Form submission triggered', {
        dealId,
        dealType,
        step: 'Step0_SocialMedia',
        operation: 'handleContinueClick'
      });
    } catch (error) {
      logger.error('Failed to trigger form submission', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step0_SocialMedia',
        operation: 'handleContinueClick'
      });
    }
  };

  // Get deal type display information
  const getDealTypeInfo = () => {
    switch (dealType) {
      case 'simple':
        return {
          title: 'Simple Deal Logging',
          description: 'Basic deal tracking without predictive analysis'
        };
      case 'clearinghouse':
        return {
          title: 'NIL Go Clearinghouse Check',
          description: 'Includes clearinghouse approval prediction'
        };
      case 'valuation':
        return {
          title: 'Deal Valuation Analysis',
          description: 'Includes fair market value analysis'
        };
      default:
        return {
          title: 'Standard Deal Process',
          description: 'Complete deal wizard'
        };
    }
  };

  const dealTypeInfo = getDealTypeInfo();

  // Get progress information - all deal types use same 10-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '1 of 10',
      percentage: 10
    };
  };

  const progressInfo = getProgressInfo();

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
    <DealWizardStepWrapper stepNumber={0} stepName="Social Media Setup" dealId={dealId}>
      <Container maxW="2xl" py={6}>
        <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
          <CardHeader pb={6}>
            {/* Progress Indicator - Updated for new step */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">{progressInfo.stepNumber}</Text>
                <Text color="brand.textSecondary">{progressInfo.percentage}% Complete</Text>
              </Flex>
              <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
                <Box
                  bg="brand.accentPrimary"
                  h="2"
                  w={`${progressInfo.percentage}%`}
                  rounded="full"
                  transition="width 0.5s ease-out"
                />
              </Box>
            </VStack>

            {/* Deal Type Indicator */}
            {dealType !== 'standard' && (
              <Alert status="info" borderRadius="lg" mb={4}>
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="semibold" color="brand.textPrimary">
                    {dealTypeInfo.title}
                  </Text>
                  <Text fontSize="sm" color="brand.textSecondary">
                    {dealTypeInfo.description}
                  </Text>
                </VStack>
              </Alert>
            )}

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
              <Box ref={formRef} w="full">
                <SocialMediaForm
                  initialData={socialMediaData}
                  onSubmit={handleNext}
                  isLoading={loading}
                />
              </Box>

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
                  isLoading={loading}
                  onClick={handleContinueClick}
                  _hover={{
                    bg: "#c8aeb0",
                  }}
                >
                  Next
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step0_SocialMedia;