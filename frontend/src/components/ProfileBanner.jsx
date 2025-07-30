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
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  SkeletonCircle,
  usePrefersReducedMotion,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiMapPin,
  FiAward,
  FiCalendar,
  FiMail,
  FiUser,
  FiPhone
} from 'react-icons/fi';

const ProfileBanner = ({
  profile,
  loading = false,
  onEditClick,
  ...props
}) => {
  // Component state for enhanced interactivity
  const [isHovered, setIsHovered] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure();

  // Motion preferences for accessibility
  const prefersReducedMotion = usePrefersReducedMotion();

  // Initialize component once
  useEffect(() => {
    if (!hasInitialized && !loading) {
      setHasInitialized(true);
    }
  }, [hasInitialized, loading]);

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

  // Responsive design values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textOnGradient = 'white';
  const gradientStart = 'brand.accentPrimary';
  const gradientEnd = 'brand.accentSecondary';

  // Responsive sizing
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const titleSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const spacing = useBreakpointValue({ base: 3, sm: 4, md: 6 });
  const flexDirection = useBreakpointValue({ base: 'column', lg: 'row' });
  const textAlign = useBreakpointValue({ base: 'center', lg: 'left' });
  const buttonSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' });

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

  // Loading state - only show if truly loading and not initialized
  if (loading && !hasInitialized) {
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
    <>
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
                <Tooltip label="Contact Information" placement="top">
                  <Button
                    leftIcon={<FiUser />}
                    size={buttonSize}
                    variant="ghost"
                    color="white"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.1)',
                      transform: 'scale(1.05)'
                    }}
                    onClick={onContactOpen}
                  >
                    Contact
                  </Button>
                </Tooltip>
              </VStack>
            </Flex>
          </Box>
        </CardBody>
      </Card>

      {/* Contact Information Modal */}
      <Modal isOpen={isContactOpen} onClose={onContactClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              {profileData.email && (
                <HStack spacing={3}>
                  <Icon as={FiMail} color="brand.accentPrimary" boxSize="5" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                      Email
                    </Text>
                    <Text fontSize="md" color="brand.textPrimary">
                      {profileData.email}
                    </Text>
                  </VStack>
                </HStack>
              )}
              {profileData.phone && (
                <HStack spacing={3}>
                  <Icon as={FiPhone} color="brand.accentPrimary" boxSize="5" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                      Phone
                    </Text>
                    <Text fontSize="md" color="brand.textPrimary">
                      {profileData.phone}
                    </Text>
                  </VStack>
                </HStack>
              )}
              {!profileData.email && !profileData.phone && (
                <Text color="brand.textSecondary" textAlign="center" w="full">
                  No contact information available. Please update your profile to add contact details.
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={onContactClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedProfileBanner = memo(ProfileBanner, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.profile) === JSON.stringify(nextProps.profile)
  );
});

MemoizedProfileBanner.displayName = 'ProfileBanner';

export default MemoizedProfileBanner;