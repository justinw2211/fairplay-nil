import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  HStack,
  VStack,
  Avatar,
  Text,
  Button,
  Badge,
  Icon,
  Progress,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Divider,
  SimpleGrid,
  Circle,
  Fade,
  ScaleFade,
  SlideFade,
  usePrefersReducedMotion,
  IconButton,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiMapPin,
  FiAward,
  FiCalendar,
  FiTrendingUp,
  FiMail,
  FiUser,
  FiStar,
  FiUsers,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import useSocialMedia from '../hooks/use-social-media';

// Animation keyframes for enhanced micro-interactions
const pulseKeyframes = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInUpKeyframes = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const ProfileBanner = ({ 
  profile, 
  loading = false, 
  onEditClick, 
  showSocialMedia = false, 
  socialMediaCount = 0,
  ...props 
}) => {
  // Component state for enhanced interactivity
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [lastErrorShown, setLastErrorShown] = useState(null);
  const { isOpen: isStatsExpanded, onToggle: toggleStats } = useDisclosure({ defaultIsOpen: true });
  
  // Motion preferences for accessibility
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Toast for user notifications
  const toast = useToast();
  
  // Social media hook integration
  const { fetchSocialMedia, loading: socialLoading, error: socialError } = useSocialMedia();
  
  // Enhanced animation timing
  useEffect(() => {
    if (!loading) {
      setAnimationDelay(100);
    }
  }, [loading]);

  // Memoized social media data fetching
  const fetchSocialMediaData = useCallback(async () => {
    if (!showSocialMedia || loading) return;
    
    try {
      const data = await fetchSocialMedia();
      setSocialMediaData(data || []);
    } catch (error) {
      console.error('Error fetching social media:', error);
      setSocialMediaData([]);
      
      // Show toast notification for social media errors (but not too frequently)
      const errorKey = `social_media_${error.message}`;
      if (lastErrorShown !== errorKey) {
        setLastErrorShown(errorKey);
        toast({
          title: "Social Media Loading Error",
          description: "Unable to load social media data. Using cached information.",
          status: "warning",
          duration: 4000,
          isClosable: true,
          position: "bottom-right"
        });
      }
    }
  }, [showSocialMedia, loading, fetchSocialMedia, lastErrorShown, toast]);

  // Fetch social media data on component mount
  useEffect(() => {
    fetchSocialMediaData();
  }, [fetchSocialMediaData]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = useCallback((profileData) => {
    if (!profileData) return 0;
    
    const requiredFields = [
      'full_name', 'displayName', 'first_name', 'last_name', // Name fields
      'university', 'school', // University fields
      'sports', 'sport', // Sport fields
      'division' // Division field
    ];
    
    const optionalFields = [
      'phone', 'phone_number', // Phone fields
      'graduation_year', 'class_year', // Graduation fields
      'avatar_url', 'profile_image', // Avatar fields
      'bio', 'description', // Bio fields
      'email' // Email field
    ];
    
    // Check required fields (worth 60% of completion)
    const filledRequired = requiredFields.filter(field => {
      const value = profileData[field];
      return value && value !== '' && value !== null && value !== undefined;
    }).length;
    
    // Check optional fields (worth 40% of completion)
    const filledOptional = optionalFields.filter(field => {
      const value = profileData[field];
      return value && value !== '' && value !== null && value !== undefined;
    }).length;
    
    // Calculate completion percentage
    const requiredScore = (filledRequired / Math.min(requiredFields.length, 4)) * 60; // Cap at 4 required fields
    const optionalScore = (filledOptional / optionalFields.length) * 40;
    
    return Math.min(Math.round(requiredScore + optionalScore), 100);
  }, []);

  // Calculate social media completion
  const calculateSocialMediaCompletion = useCallback((socialPlatforms) => {
    if (!socialPlatforms || socialPlatforms.length === 0) return 0;
    
    const totalPlatforms = 3; // Instagram, Twitter, TikTok
    const activePlatforms = socialPlatforms.filter(platform => 
      platform.handle && platform.followers >= 0
    ).length;
    
    return Math.min((activePlatforms / totalPlatforms) * 100, 100);
  }, []);

  // Calculate total follower count
  const calculateTotalFollowers = useCallback((socialPlatforms) => {
    if (!socialPlatforms || socialPlatforms.length === 0) return 0;
    
    return socialPlatforms.reduce((total, platform) => {
      return total + (platform.followers || 0);
    }, 0);
  }, []);

  // Retry handler for failed operations
  const handleRetry = useCallback(async () => {
    try {
      await fetchSocialMediaData();
      toast({
        title: "Retry Successful",
        description: "Data has been refreshed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: "Unable to refresh data. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right"
      });
    }
  }, [fetchSocialMediaData, toast]);

  // Theme values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const gradientBg = useColorModeValue(
    'linear(to-r, brand.accentPrimary, #c9b2a9)',
    'linear(to-r, brand.accentPrimary, #a69690)'
  );
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)');
  const textOnGradient = 'white';
  const textOnCard = useColorModeValue('brand.textPrimary', 'white');
  const textSecondary = useColorModeValue('brand.textSecondary', 'gray.400');

  // Enhanced responsive values with more granular breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  
  const avatarSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' });
  const cardPadding = useBreakpointValue({ base: 3, sm: 4, md: 6 });
  const titleSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' });
  const spacing = useBreakpointValue({ base: 3, sm: 4, md: 6 });
  const flexDirection = useBreakpointValue({ base: 'column', lg: 'row' });
  const textAlign = useBreakpointValue({ base: 'center', lg: 'left' });
  const buttonSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' });
  const showDetailedInfo = useBreakpointValue({ base: false, sm: true });
  const stackStats = useBreakpointValue({ base: true, md: false });
  const compactView = useBreakpointValue({ base: true, sm: false });

  // Profile data with fallbacks and calculated completion
  const profileData = {
    name: profile?.displayName || profile?.full_name || 'Student-Athlete',
    initials: profile?.initials || 'SA',
    university: profile?.university || profile?.school || 'University',
    sports: profile?.sports?.join(', ') || profile?.sport || 'Sport',
    division: profile?.division || 'Division',
    graduationYear: profile?.expected_graduation_year ? `Class of ${profile.expected_graduation_year}` : 'Class of TBD',
    completionPercentage: calculateProfileCompletion(profile),
    isComplete: calculateProfileCompletion(profile) >= 90,
    email: profile?.email || '',
    phone: profile?.phone || profile?.phone_number || '',
    bio: profile?.bio || profile?.description || '',
    avatar_url: profile?.avatar_url || profile?.profile_image || ''
  };

  // Social media data with calculations
  const socialMediaInfo = {
    platforms: socialMediaData,
    count: socialMediaData.length,
    completionPercentage: calculateSocialMediaCompletion(socialMediaData),
    totalFollowers: calculateTotalFollowers(socialMediaData),
    isComplete: socialMediaData.length >= 2,
    loading: socialLoading,
    error: socialError
  };

  // Status badge configuration
  const getStatusBadge = () => {
    if (profileData.completionPercentage >= 90) {
      return { text: 'Complete', colorScheme: 'green' };
    } else if (profileData.completionPercentage >= 70) {
      return { text: 'Almost Done', colorScheme: 'orange' };
    } else {
      return { text: 'Needs Work', colorScheme: 'red' };
    }
  };

  const statusBadge = getStatusBadge();

  // Loading state
  if (loading) {
    return (
      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        mb={6}
        shadow="lg"
        {...props}
      >
        <CardBody p={cardPadding}>
          <Flex
            direction={flexDirection}
            align="center"
            justify="space-between"
            gap={spacing}
          >
            <HStack spacing={spacing} flex={1}>
              <SkeletonCircle size={avatarSize === '2xl' ? '96px' : '80px'} />
              <VStack align="start" spacing={2} flex={1}>
                <Skeleton height="32px" width="200px" />
                <Skeleton height="20px" width="150px" />
                <Skeleton height="16px" width="300px" />
              </VStack>
            </HStack>
            <VStack spacing={2}>
              <Skeleton height="40px" width="120px" />
              <Skeleton height="24px" width="80px" />
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <ScaleFade 
      in={!loading} 
      initialScale={prefersReducedMotion ? 1 : 0.9}
      transition={{ enter: { duration: 0.4, delay: animationDelay / 1000 } }}
    >
      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        mb={6}
        shadow={isHovered ? "xl" : "lg"}
        transition={prefersReducedMotion ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"}
        transform={isHovered && !prefersReducedMotion ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)"}
        _hover={{
          borderColor: 'brand.accentPrimary'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="banner"
        aria-label="Student athlete profile summary"
        {...props}
      >
        <CardBody p={0}>
          {/* Gradient Header Section */}
          <Box
            bgGradient={gradientBg}
            position="relative"
            overflow="hidden"
            p={cardPadding}
          >
            {/* Background Pattern */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              opacity={0.1}
              bg="repeating-linear-gradient(
                45deg,
                white,
                white 10px,
                transparent 10px,
                transparent 20px
              )"
            />

            {/* Header Content */}
            <Box position="relative">
              <Flex
                direction={flexDirection}
                align="center"
                justify="space-between"
                gap={spacing}
              >
                {/* Profile Info Section */}
                <HStack spacing={spacing} flex={1} textAlign={textAlign}>
                  {/* Avatar with Status Indicator */}
                  <SlideFade 
                    in={!loading} 
                    offsetY="20px"
                    delay={prefersReducedMotion ? 0 : 0.1}
                  >
                    <Box position="relative">
                      <Avatar
                        size={avatarSize}
                        name={profileData.name}
                        src={profile?.avatar_url}
                        bg="white"
                        color="brand.accentPrimary"
                        border="4px solid"
                        borderColor="white"
                        shadow="lg"
                        transition={prefersReducedMotion ? "none" : "all 0.3s ease"}
                        _hover={{
                          shadow: "xl",
                          transform: prefersReducedMotion ? "none" : "scale(1.05)"
                        }}
                        cursor="pointer"
                      />
                      {/* Status Indicator */}
                      <Circle
                        size="6"
                        animation={prefersReducedMotion ? "none" : `${pulseKeyframes} 2s infinite`}
                      bg={statusBadge.colorScheme === 'green' ? 'green.500' : 'orange.500'}
                      position="absolute"
                      bottom="0"
                      right="0"
                      border="2px solid"
                      borderColor="white"
                    >
                      <Icon
                        as={statusBadge.colorScheme === 'green' ? FiStar : FiTrendingUp}
                        boxSize="3"
                        color="white"
                      />
                    </Circle>
                  </Box>
                  </SlideFade>

                  {/* Name and Details */}
                  <VStack align={textAlign === 'center' ? 'center' : 'start'} spacing={2} flex={1}>
                    <HStack spacing={3} flexWrap="wrap" justify={textAlign === 'center' ? 'center' : 'start'}>
                      <Text
                        fontSize={titleSize}
                        fontWeight="bold"
                        color={textOnGradient}
                        lineHeight="none"
                      >
                        {profileData.name}
                      </Text>
                      <Badge
                        bg="white"
                        color="brand.accentPrimary"
                        fontWeight="bold"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {profileData.division}
                      </Badge>
                    </HStack>

                    <HStack
                      spacing={6}
                      color={textOnGradient}
                      opacity={0.9}
                      fontSize="md"
                      flexWrap="wrap"
                      justify={textAlign === 'center' ? 'center' : 'start'}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiMapPin} boxSize="4" />
                        <Text>{profileData.university}</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FiAward} boxSize="4" />
                        <Text>{profileData.sports}</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} boxSize="4" />
                        <Text>{profileData.graduationYear}</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>

                {/* Action Buttons */}
                <VStack spacing={3} align="center">
                  <Tooltip label="Edit Profile" placement="top">
                    <Button
                      leftIcon={<FiEdit2 />}
                      size={buttonSize}
                      bg="white"
                      color="brand.accentPrimary"
                      borderColor="white"
                      _hover={{
                        bg: 'brand.backgroundLight',
                        transform: 'scale(1.05)'
                      }}
                      onClick={onEditClick}
                      shadow="md"
                    >
                      Edit Profile
                    </Button>
                  </Tooltip>
                  <Badge
                    colorScheme={statusBadge.colorScheme}
                    variant="solid"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {statusBadge.text}
                  </Badge>
                </VStack>
              </Flex>
            </Box>
          </Box>

          {/* Stats Section */}
          <Box p={cardPadding} bg={cardBg}>
            {/* Stats Header with Toggle (Mobile Only) */}
            {(isMobile || isTablet) && (
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" fontWeight="semibold" color={textOnCard}>
                  Profile Details
                </Text>
                <IconButton
                  icon={<Icon as={isStatsExpanded ? FiChevronUp : FiChevronDown} />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleStats}
                  aria-label="Toggle profile details"
                />
              </Flex>
            )}

            <Collapse in={isStatsExpanded || isDesktop} animateOpacity>
              <SimpleGrid 
                columns={stackStats ? 1 : { base: 1, md: 3 }} 
                spacing={compactView ? 4 : 6}
              >
              {/* Profile Completion */}
              <VStack spacing={2}>
                <HStack spacing={2} w="full" justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiBookOpen} color="brand.accentPrimary" boxSize="4" />
                    <Text fontSize="sm" fontWeight="medium" color={textOnCard}>
                      Profile Completion
                    </Text>
                  </HStack>
                  <Tooltip 
                    label={`${profileData.completionPercentage}% Complete. Essential fields: Name, University, Sport, Division. Bonus: Phone, Bio, Avatar.`}
                    placement="top"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold" color={textOnCard}>
                        {profileData.completionPercentage}%
                      </Text>
                      <Icon 
                        as={profileData.isComplete ? FiCheck : FiTrendingUp} 
                        color={profileData.isComplete ? "green.500" : "orange.500"} 
                        boxSize="3" 
                      />
                    </HStack>
                  </Tooltip>
                </HStack>
                <Progress
                  value={profileData.completionPercentage}
                  size="sm"
                  borderRadius="full"
                  bg="brand.backgroundLight"
                  colorScheme={statusBadge.colorScheme}
                  w="full"
                  hasStripe={!prefersReducedMotion}
                  isAnimated={!prefersReducedMotion}
                  transition="all 0.5s ease"
                />
                {!compactView && profileData.completionPercentage < 100 && (
                  <VStack spacing={1} w="full" align="start">
                    <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                      Missing fields:
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {!profileData.name && (
                        <Badge colorScheme="orange" variant="outline" fontSize="xs">Name</Badge>
                      )}
                      {!profileData.university && (
                        <Badge colorScheme="orange" variant="outline" fontSize="xs">University</Badge>
                      )}
                      {!profileData.sports && (
                        <Badge colorScheme="orange" variant="outline" fontSize="xs">Sport</Badge>
                      )}
                      {!profileData.division && (
                        <Badge colorScheme="orange" variant="outline" fontSize="xs">Division</Badge>
                      )}
                      {!profileData.phone && (
                        <Badge colorScheme="gray" variant="outline" fontSize="xs">Phone</Badge>
                      )}
                      {!profileData.bio && (
                        <Badge colorScheme="gray" variant="outline" fontSize="xs">Bio</Badge>
                      )}
                      {!profileData.avatar_url && (
                        <Badge colorScheme="gray" variant="outline" fontSize="xs">Avatar</Badge>
                      )}
                    </HStack>
                  </VStack>
                )}
              </VStack>

              {/* Social Media Status */}
              {showSocialMedia && (
                <VStack spacing={2}>
                  <HStack spacing={2} w="full" justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={FiUsers} color="brand.accentPrimary" boxSize="4" />
                      <Text fontSize="sm" fontWeight="medium" color={textOnCard}>
                        Social Media
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={socialMediaInfo.isComplete ? 'green' : 'orange'}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {socialMediaInfo.count} Platform{socialMediaInfo.count !== 1 ? 's' : ''}
                      </Badge>
                      {socialMediaInfo.totalFollowers > 0 && (
                        <Badge
                          colorScheme="blue"
                          variant="outline"
                          fontSize="xs"
                        >
                          {socialMediaInfo.totalFollowers.toLocaleString()} followers
                        </Badge>
                      )}
                    </HStack>
                  </HStack>
                  <Progress
                    value={socialMediaInfo.completionPercentage}
                    size="sm"
                    borderRadius="full"
                    bg="brand.backgroundLight"
                    colorScheme={socialMediaInfo.isComplete ? "green" : "orange"}
                    w="full"
                    hasStripe={!prefersReducedMotion}
                    isAnimated={!prefersReducedMotion}
                    transition="all 0.5s ease"
                  />
                  {socialMediaInfo.platforms.length > 0 && !compactView && (
                    <HStack spacing={2} w="full" justify="center">
                      {socialMediaInfo.platforms.map((platform, index) => (
                        <Tooltip key={index} label={`${platform.handle} - ${platform.followers?.toLocaleString()} followers`}>
                          <Badge
                            colorScheme="gray"
                            variant="outline"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            <HStack spacing={1}>
                              <Icon 
                                as={platform.platform === 'instagram' ? FiInstagram : 
                                    platform.platform === 'twitter' ? FiTwitter : 
                                    platform.platform === 'tiktok' ? FiYoutube : FiUsers} 
                                boxSize="3" 
                              />
                              <Text fontSize="xs">{platform.platform}</Text>
                            </HStack>
                          </Badge>
                        </Tooltip>
                      ))}
                    </HStack>
                                     )}
                 </VStack>
               )}

              {/* Social Media Error Display */}
              {showSocialMedia && socialMediaInfo.error && (
                <Alert status="warning" borderRadius="md" fontSize="sm">
                  <AlertIcon boxSize="4" />
                  <VStack align="start" spacing={2} flex={1}>
                    <AlertDescription>
                      Unable to load social media data. Please try again.
                    </AlertDescription>
                    <Button
                      size="xs"
                      colorScheme="orange"
                      variant="outline"
                      leftIcon={<Icon as={FiEdit2} />}
                      onClick={handleRetry}
                      isLoading={socialMediaInfo.loading}
                      loadingText="Retrying..."
                    >
                      Retry
                    </Button>
                  </VStack>
                </Alert>
              )}

              {/* Contact Information */}
              <VStack spacing={2}>
                <HStack spacing={2} w="full" justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiMail} color="brand.accentPrimary" boxSize="4" />
                    <Text fontSize="sm" fontWeight="medium" color={textOnCard}>
                      Contact
                    </Text>
                  </HStack>
                  <VStack spacing={1} align="end">
                    <Badge
                      colorScheme={profileData.email ? 'green' : 'gray'}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {profileData.email ? 'Email Set' : 'No Email'}
                    </Badge>
                    {profileData.phone && (
                      <Badge
                        colorScheme="blue"
                        variant="outline"
                        fontSize="xs"
                      >
                        Phone Set
                      </Badge>
                    )}
                  </VStack>
                </HStack>
                {profileData.email && !compactView && (
                  <Text fontSize="xs" color={textSecondary} w="full" textAlign="left">
                    {profileData.email}
                  </Text>
                )}
                {profileData.phone && !compactView && (
                  <Text fontSize="xs" color={textSecondary} w="full" textAlign="left">
                    {profileData.phone}
                  </Text>
                )}
              </VStack>
            </SimpleGrid>
            </Collapse>

            {/* Call to Action for Profile Completion */}
            {profileData.completionPercentage < 80 && (
              <SlideFade 
                in={true} 
                offsetY="10px"
                delay={prefersReducedMotion ? 0 : 0.3}
              >
                <Box
                  mt={4}
                  p={4}
                  bg="orange.50"
                  borderRadius="lg"
                  borderLeft="4px solid"
                  borderColor="orange.400"
                  cursor="pointer"
                  onClick={onEditClick}
                  transition={prefersReducedMotion ? "none" : "all 0.2s ease"}
                  _hover={{
                    bg: "orange.100",
                    transform: prefersReducedMotion ? "none" : "translateX(4px)",
                    borderLeftWidth: "6px"
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Click to edit profile and complete missing information"
                >
                  <HStack spacing={2}>
                    <Icon 
                      as={FiTrendingUp} 
                      color="orange.600" 
                      boxSize="4"
                      animation={prefersReducedMotion ? "none" : `${pulseKeyframes} 3s infinite`}
                    />
                    <Text fontSize="sm" color="orange.700" fontWeight="medium">
                      Complete your profile to unlock better deal valuations
                    </Text>
                    <Icon as={FiEdit2} color="orange.500" boxSize="3" />
                  </HStack>
                </Box>
              </SlideFade>
            )}

            {/* Performance Badge for High Completion */}
            {profileData.completionPercentage >= 90 && (
              <SlideFade 
                in={true} 
                offsetY="10px"
                delay={prefersReducedMotion ? 0 : 0.4}
              >
                <Box
                  mt={4}
                  p={3}
                  bg="green.50"
                  borderRadius="lg"
                  borderLeft="4px solid"
                  borderColor="green.400"
                >
                  <HStack spacing={2}>
                    <Icon as={FiStar} color="green.600" boxSize="4" />
                    <Text fontSize="sm" color="green.700" fontWeight="medium">
                      🎉 Profile complete! You're ready for premium deal opportunities
                    </Text>
                  </HStack>
                </Box>
              </SlideFade>
            )}
          </Box>
        </CardBody>
      </Card>
    </ScaleFade>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedProfileBanner = memo(ProfileBanner, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.showSocialMedia === nextProps.showSocialMedia &&
    prevProps.socialMediaCount === nextProps.socialMediaCount &&
    JSON.stringify(prevProps.profile) === JSON.stringify(nextProps.profile)
  );
});

MemoizedProfileBanner.displayName = 'ProfileBanner';

export default MemoizedProfileBanner; 