import { useState, useEffect, useCallback, memo } from 'react';
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
  SkeletonCircle,
  SimpleGrid,
  ScaleFade,
  SlideFade,
  usePrefersReducedMotion,
  IconButton,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
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
  FiUsers,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiCheck
} from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import useSocialMedia from '../hooks/use-social-media';

// Animation keyframes for enhanced micro-interactions
const pulseKeyframes = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const ProfileBanner = ({
  profile,
  loading = false,
  onEditClick,
  showSocialMedia = false,
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
    if (!showSocialMedia || loading) {
      return;
    }

    try {
      const data = await fetchSocialMedia();
      setSocialMediaData(data || []);
    } catch (error) {
      console.error('Error fetching social media:', error);
      setSocialMediaData([]);

      // Show error toast only once per error
      const errorKey = error.message || 'unknown';
      if (lastErrorShown !== errorKey) {
        setLastErrorShown(errorKey);
        toast({
          title: "Social Media Error",
          description: "Unable to load social media data. Please try again.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [showSocialMedia, loading, fetchSocialMedia, toast, lastErrorShown]);

  // Fetch social media data on mount and when dependencies change
  useEffect(() => {
    fetchSocialMediaData();
  }, [fetchSocialMediaData]);

  // Profile completion calculation
  const calculateProfileCompletion = useCallback((profile) => {
    if (!profile) {
      return 0;
    }

    const fields = [
      profile?.displayName || profile?.full_name || profile?.first_name || profile?.last_name,
      profile?.university || profile?.school,
      profile?.sports || profile?.sport,
      profile?.division
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, []);

  // Social media completion calculation
  const calculateSocialMediaCompletion = useCallback((platforms) => {
    if (!platforms || platforms.length === 0) {
      return 0;
    }
    const validPlatforms = platforms.filter(p => p.platform && p.handle);
    return Math.round((validPlatforms.length / Math.max(platforms.length, 1)) * 100);
  }, []);

  // Total followers calculation
  const calculateTotalFollowers = useCallback((platforms) => {
    if (!platforms || platforms.length === 0) {
      return 0;
    }
    return platforms.reduce((total, platform) => {
      return total + (parseInt(platform.followers) || 0);
    }, 0);
  }, []);

  // Retry handler for social media
  const handleRetry = useCallback(() => {
    fetchSocialMediaData();
  }, [fetchSocialMediaData]);

  // Responsive design values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textOnCard = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const textOnGradient = 'white';
  const gradientStart = 'brand.accentPrimary';
  const gradientEnd = 'brand.accentSecondary';

  // Responsive sizing
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const titleSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const spacing = useBreakpointValue({ base: 3, sm: 4, md: 6 });
  const flexDirection = useBreakpointValue({ base: 'column', lg: 'row' });
  const textAlign = useBreakpointValue({ base: 'center', lg: 'left' });
  const buttonSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' });
  const stackStats = useBreakpointValue({ base: true, md: false });
  const compactView = useBreakpointValue({ base: true, sm: false });

  // Profile data with fallbacks and calculated completion
  const profileData = {
    name: profile?.displayName ||
          profile?.full_name ||
          profile?.first_name ||
          profile?.last_name ||
          profile?.email?.split('@')[0] ||
          profile?.user_metadata?.full_name ||
          // Handle Supabase user object structure
          (profile?.user_metadata?.first_name && profile?.user_metadata?.last_name
            ? `${profile.user_metadata.first_name} ${profile.user_metadata.last_name}`
            : profile?.user_metadata?.first_name || profile?.user_metadata?.last_name) ||
          // Email prefix as last resort
          (profile?.email ? profile.email.split('@')[0] : null) ||
          'Student-Athlete',
    initials: profile?.initials ||
              (profile?.displayName || profile?.full_name || profile?.first_name || profile?.last_name || profile?.email)?.substring(0, 2).toUpperCase() ||
              // Handle Supabase user metadata for initials
              (profile?.user_metadata?.first_name && profile?.user_metadata?.last_name
                ? `${profile.user_metadata.first_name[0]}${profile.user_metadata.last_name[0]}`
                : profile?.user_metadata?.first_name?.[0] || profile?.user_metadata?.last_name?.[0]) ||
              'SA',
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
      >
        <CardBody p={0}>
          {/* Gradient Header Skeleton */}
          <Box
            bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
            p={cardPadding}
          >
            <Flex
              direction={flexDirection}
              align="center"
              justify="space-between"
              gap={spacing}
            >
              <HStack spacing={spacing} flex={1}>
                <SkeletonCircle size={avatarSize} />
                <VStack align={textAlign === 'center' ? 'center' : 'start'} spacing={2} flex={1}>
                  <Skeleton height="24px" width="200px" />
                  <Skeleton height="16px" width="150px" />
                </VStack>
              </HStack>
              <VStack spacing={3} align="center">
                <Skeleton height="32px" width="100px" />
                <Skeleton height="20px" width="80px" />
              </VStack>
            </Flex>
          </Box>
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
            bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
            p={cardPadding}
            position="relative"
            overflow="hidden"
          >
            {/* Background Pattern */}
            <Box
              position="absolute"
              top="0"
              right="0"
              width="200px"
              height="200px"
              opacity="0.1"
              background="radial-gradient(circle, white 2px, transparent 2px)"
              backgroundSize="20px 20px"
              transform="rotate(45deg)"
            />

            <Flex
              direction={flexDirection}
              align="center"
              justify="space-between"
              gap={spacing}
              position="relative"
              zIndex={1}
            >
              {/* Profile Info Section */}
              <HStack spacing={spacing} flex={1} textAlign={textAlign}>
                {/* Avatar */}
                <SlideFade
                  in={!loading}
                  offsetY="20px"
                  delay={prefersReducedMotion ? 0 : 0.1}
                >
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
                      label={`${profileData.completionPercentage}% Complete. Essential fields: Name, University, Sport, Division.`}
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
                      <VStack spacing={1} align="end">
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
                      </VStack>
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
                    {/* Missing Social Media Warning */}
                    {socialMediaInfo.count === 0 && !compactView && (
                      <VStack spacing={1} w="full" align="start">
                        <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                          Missing social media:
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="orange" variant="outline" fontSize="xs">Instagram</Badge>
                          <Badge colorScheme="orange" variant="outline" fontSize="xs">Twitter/X</Badge>
                          <Badge colorScheme="orange" variant="outline" fontSize="xs">TikTok</Badge>
                        </HStack>
                      </VStack>
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
                    <Icon as={FiCheck} color="green.600" boxSize="4" />
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