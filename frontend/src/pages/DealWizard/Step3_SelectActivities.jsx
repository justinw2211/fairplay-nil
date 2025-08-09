// frontend/src/pages/DealWizard/Step3_SelectActivities.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import * as Sentry from '@sentry/react';

const activities = [
  {
    id: "social-media",
    title: "Social Media",
    description: "Photos or videos posted to your personal social media account",
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Live in-person or virtual events like games, meet and greets, or photo shoots",
  },
  {
    id: "content-for-brand",
    title: "Content for Brand",
    description: "Photos or videos you create or share with your payor for them to use",
  },
  {
    id: "autographs",
    title: "Autographs",
    description: "Signing autographs on items or memorabilia like posters, hats, or equipment",
  },
  {
    id: "merch-and-products",
    title: "Merch and Products",
    description: "Your payor sells items with your name or image like jerseys or bobbleheads",
  },
  {
    id: "endorsements",
    title: "Endorsements",
    description: "You wear or use products from your payor in public appearances or competitions",
  },
  {
    id: "other",
    title: "Other",
    description: "My activity is not reflected in the listed categories",
  },
];

const Step3_SelectActivities = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();
  const toast = useToast();

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [otherActivity, setOtherActivity] = useState("");

  useEffect(() => {
    if (currentDeal?.obligations) {
      console.log('🔄 Loading activities from obligations:', currentDeal.obligations);
      
      // Track activity loading attempt
      Sentry.captureMessage('Step3_SelectActivities: Loading activities from obligations', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'load_activities',
          dealId
        },
        extra: {
          dealId,
          dealType,
          obligations: currentDeal.obligations,
          obligationsKeys: Object.keys(currentDeal.obligations),
          step: 'Step3_SelectActivities',
          operation: 'useEffect'
        }
      });
      
      // Filter out invalid activity types but preserve valid ones
      const validActivities = Object.keys(currentDeal.obligations).filter(activity => {
        const validActivityTypes = [
          'social-media', 'appearance', 'content-for-brand', 'autographs', 
          'merch-and-products', 'endorsements', 'other'
        ];
        const isValid = validActivityTypes.includes(activity);
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid activity type:', activity);
          
          // Track invalid activity filtering
          Sentry.captureMessage('Step3_SelectActivities: Filtering invalid activity', 'warning', {
            tags: {
              component: 'Step3_SelectActivities',
              action: 'filter_invalid_activity',
              dealId
            },
            extra: {
              dealId,
              dealType,
              invalidActivity: activity,
              validActivityTypes,
              step: 'Step3_SelectActivities',
              operation: 'useEffect'
            }
          });
        }
        return isValid;
      });
      
      console.log('✅ Valid activities found:', validActivities);
      
      // Track successful activity loading
      Sentry.captureMessage('Step3_SelectActivities: Activities loaded successfully', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'activities_loaded',
          dealId
        },
        extra: {
          dealId,
          dealType,
          validActivities,
          validActivitiesCount: validActivities.length,
          step: 'Step3_SelectActivities',
          operation: 'useEffect'
        }
      });
      
      setSelectedActivities(validActivities);
      
      if (currentDeal.obligations.other?.description) {
        setOtherActivity(currentDeal.obligations.other.description);
      }
    } else {
      console.log('📝 No obligations found, starting with empty selection');
      
      // Track empty obligations case
      Sentry.captureMessage('Step3_SelectActivities: No obligations found', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'no_obligations',
          dealId
        },
        extra: {
          dealId,
          dealType,
          hasCurrentDeal: !!currentDeal,
          currentDealKeys: currentDeal ? Object.keys(currentDeal) : [],
          step: 'Step3_SelectActivities',
          operation: 'useEffect'
        }
      });
      
      setSelectedActivities([]);
    }
  }, [currentDeal]);

  const handleActivityChange = (activityId, checked) => {
    if (checked) {
      setSelectedActivities([...selectedActivities, activityId]);
    } else {
      setSelectedActivities(selectedActivities.filter((a) => a !== activityId));
      if (activityId === "other") {
        setOtherActivity("");
      }
    }
  };

  const isFormValid = selectedActivities.length > 0 && (!selectedActivities.includes("other") || otherActivity.trim());

  const handleBack = () => {
    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/payor/${dealId}${typeParam}`);
  };

  const handleNext = async () => {
    // Track navigation attempt
    Sentry.captureMessage('Step3_SelectActivities: Navigation attempt started', 'info', {
      tags: {
        component: 'Step3_SelectActivities',
        action: 'navigation_attempt',
        dealId
      },
      extra: {
        dealId,
        dealType,
        selectedActivities,
        selectedActivitiesCount: selectedActivities.length,
        otherActivity,
        step: 'Step3_SelectActivities',
        operation: 'handleNext'
      }
    });
    
    // Validate that we have at least one activity selected
    if (selectedActivities.length === 0) {
      console.error('❌ No activities selected');
      
      // Track no activities selected error
      Sentry.captureMessage('Step3_SelectActivities: No activities selected', 'error', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'no_activities_selected',
          dealId
        },
        extra: {
          dealId,
          dealType,
          selectedActivities,
          selectedActivitiesCount: selectedActivities.length,
          step: 'Step3_SelectActivities',
          operation: 'handleNext'
        }
      });
      
      toast({
        title: 'No Activities Selected',
        description: 'Please select at least one activity to continue.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Create obligations with proper sequential ordering while PRESERVING any existing activity data
    const newObligations = {};
    selectedActivities.forEach((activity, index) => {
      const existing = currentDeal?.obligations?.[activity] || {};

      // Preserve prior fields (like details, quantities, etc.), update sequence and keep existing completion state
      const merged = {
        ...existing,
        sequence: index,
        // preserve completed if already true; otherwise default to false
        completed: existing?.completed === true,
      };

      // For "other", prefer newly entered description; otherwise preserve existing description
      if (activity === "other") {
        merged.description = otherActivity || existing?.description || "";
      }

      newObligations[activity] = merged;
    });

    console.log('📝 Step3_SelectActivities Debug Info:');
    console.log('selectedActivities:', selectedActivities);
    console.log('newObligations:', newObligations);
    console.log('otherActivity:', otherActivity);

    // Track the start of the navigation process
    Sentry.captureMessage('Step3_SelectActivities: Starting navigation process', 'info', {
      tags: {
        component: 'Step3_SelectActivities',
        action: 'handleNext',
        dealId
      },
      extra: {
        dealId,
        selectedActivities,
        newObligations,
        otherActivity,
        dealType
      }
    });

    try {
      // Track the updateDeal call
      Sentry.captureMessage('Step3_SelectActivities: Calling updateDeal', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'updateDeal',
          dealId
        },
        extra: {
          dealId,
          updateData: {
            obligations: newObligations,
            currentActivityIndex: 0,
            totalActivities: selectedActivities.length,
            lastCompletedActivity: null
          }
        }
      });

      await updateDeal(dealId, {
        obligations: newObligations,
        currentActivityIndex: 0,
        totalActivities: selectedActivities.length,
        lastCompletedActivity: null // Reset last completed activity when resequencing
      });

      // Track successful updateDeal
      Sentry.captureMessage('Step3_SelectActivities: updateDeal completed successfully', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'updateDeal_success',
          dealId
        },
        extra: {
          dealId,
          selectedActivities
        }
      });

      const firstActivity = selectedActivities[0];
      
      // Validate that the first activity is a valid activity type
      const validActivityTypes = [
        'social-media', 'appearance', 'content-for-brand', 'autographs', 
        'merch-and-products', 'endorsements', 'other'
      ];
      
      if (!validActivityTypes.includes(firstActivity)) {
        console.error('❌ Invalid activity type:', firstActivity);
        console.error('Selected activities:', selectedActivities);
        console.error('Valid activity types:', validActivityTypes);
        
        // Track invalid activity type error
        Sentry.captureMessage('Step3_SelectActivities: Invalid activity type', 'error', {
          tags: {
            component: 'Step3_SelectActivities',
            action: 'invalid_activity_type',
            dealId
          },
          extra: {
            dealId,
            dealType,
            firstActivity,
            selectedActivities,
            validActivityTypes,
            step: 'Step3_SelectActivities',
            operation: 'handleNext'
          }
        });
        
        toast({
          title: 'Invalid Activity Type',
          description: `The activity "${firstActivity}" is not valid. Please select different activities.`,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        return;
      }
      
      const encodedActivity = encodeURIComponent(firstActivity);
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      
      // Track successful navigation attempt
      Sentry.captureMessage('Step3_SelectActivities: Navigating to first activity', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'navigate_to_activity',
          dealId
        },
        extra: {
          dealId,
          dealType,
          firstActivity,
          encodedActivity,
          targetUrl: `/add/deal/activity/${encodedActivity}/${dealId}${typeParam}`,
          step: 'Step3_SelectActivities',
          operation: 'handleNext'
        }
      });

      // Track successful navigation with destination URL
      const destinationUrl = `/add/deal/activity/${encodedActivity}/${dealId}${typeParam}`;
      Sentry.captureMessage('Step3_SelectActivities: Navigation successful', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'navigation_successful',
          dealId
        },
        extra: {
          dealId,
          dealType,
          firstActivity,
          encodedActivity,
          destinationUrl,
          currentUrl: window.location.href,
          selectedActivities,
          step: 'Step3_SelectActivities',
          operation: 'handleNext'
        }
      });
      
      navigate(destinationUrl);

      // Track successful navigation
      Sentry.captureMessage('Step3_SelectActivities: Navigation completed', 'info', {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'navigation_success',
          dealId
        },
        extra: {
          dealId,
          firstActivity,
          fullUrl: `/add/deal/activity/${encodedActivity}/${dealId}${typeParam}`
        }
      });

    } catch (error) {
      // Track the error with detailed context
      Sentry.captureException(error, {
        tags: {
          component: 'Step3_SelectActivities',
          action: 'handleNext_error',
          dealId
        },
        extra: {
          dealId,
          selectedActivities,
          newObligations,
          otherActivity,
          dealType,
          errorMessage: error.message,
          errorStack: error.stack
        }
      });

      toast({
        title: "Error saving activities.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFinishLater = () => {
    navigate('/dashboard');
  };

  return (
    <DealWizardStepWrapper stepNumber={3} stepName="Activity Selection">
      <Container maxW="2xl" py={6}>
        <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
          <CardHeader pb={6}>
            {/* Progress Indicator */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">Step 4 of 10</Text>
                <Text color="brand.textSecondary">40% Complete</Text>
              </Flex>
              <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
                <Box
                  bg="brand.accentPrimary"
                  h="2"
                  w="40%"
                  rounded="full"
                  transition="width 0.5s ease-out"
                />
              </Box>
            </VStack>

            {/* Header */}
            <VStack spacing={3} align="start">
              <Heading size="lg" color="brand.textPrimary">Select Activities</Heading>
              <Text color="brand.textSecondary" fontSize="lg">
                What activities or deliverables are you being paid for? Add all the activities that the payor is
                requesting you complete as part of this deal.
              </Text>
            </VStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={8}>
              {/* Activities List */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Select all that apply *
                </FormLabel>

                <VStack spacing={4} align="stretch">
                  {activities.map((activity) => {
                    const isSelected = selectedActivities.includes(activity.id);

                    return (
                      <Box
                        key={activity.id}
                        border="1px"
                        borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                        rounded="lg"
                        p={4}
                        transition="all 0.2s"
                        cursor="pointer"
                        bg={isSelected ? "brand.backgroundLight" : "white"}
                        onClick={() => handleActivityChange(activity.id, !isSelected)}
                        _hover={{ borderColor: "brand.accentPrimary", bg: "brand.backgroundLight" }}
                      >
                        <Flex gap={4}>
                          <Checkbox
                            isChecked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleActivityChange(activity.id, e.target.checked);
                            }}
                            borderColor="brand.accentSecondary"
                            sx={{
                              'span.chakra-checkbox__control': {
                                _checked: {
                                  bg: 'brand.accentPrimary',
                                  borderColor: 'brand.accentPrimary',
                                },
                              },
                            }}
                            mt={1}
                          />
                          <Box flex="1">
                            <Text color="brand.textPrimary" fontWeight="semibold" mb={2}>
                              {activity.title}
                            </Text>
                            <Text color="brand.textSecondary" fontSize="sm">
                              {activity.description}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </FormControl>

              {/* Other activity text input */}
              {selectedActivities.includes("other") && (
                <Box
                  bg="brand.backgroundLight"
                  p={6}
                  rounded="lg"
                  border="1px"
                  borderColor="brand.accentSecondary"
                >
                  <FormControl>
                    <FormLabel color="brand.textPrimary" fontWeight="semibold">
                      Please specify what other activity you'll be doing *
                    </FormLabel>
                    <Input
                      value={otherActivity}
                      onChange={(e) => setOtherActivity(e.target.value)}
                      placeholder="e.g., 'Podcast appearance', 'Brand ambassador program', 'Product development consultation'"
                      h="12"
                      fontSize="base"
                      borderColor="brand.accentSecondary"
                      _focus={{
                        borderColor: "brand.accentPrimary",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                      }}
                    />
                  </FormControl>
                </Box>
              )}

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
                  _hover={{
                    bg: "brand.backgroundLight",
                    color: "brand.textPrimary",
                  }}
                >
                  Finish Later
                </Button>

                <Flex gap={4}>
                  <Button
                    leftIcon={<Icon as={ChevronLeft} />}
                    variant="outline"
                    px={6}
                    py={3}
                    h={12}
                    fontSize="base"
                    fontWeight="semibold"
                    borderColor="brand.accentSecondary"
                    color="brand.textSecondary"
                    onClick={handleBack}
                    _hover={{
                      bg: "brand.backgroundLight",
                      borderColor: "brand.accentPrimary",
                      color: "brand.textPrimary",
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<Icon as={ChevronRight} />}
                    bg={isFormValid ? "brand.accentPrimary" : "brand.accentSecondary"}
                    color="white"
                    px={8}
                    py={3}
                    h={12}
                    fontSize="base"
                    fontWeight="semibold"
                    transition="all 0.2s"
                    _hover={
                      isFormValid
                        ? {
                            transform: "scale(1.05)",
                            bg: "brand.accentPrimary",
                            shadow: "xl",
                          }
                        : {}
                    }
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed",
                    }}
                    isDisabled={!isFormValid}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step3_SelectActivities;