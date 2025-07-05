// frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Icon,
  Text,
  VStack,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import {
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  Clock,
  Camera,
  MessageSquare,
  Radio,
  Hash,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Posts, reels, stories, or livestreams uploaded to or hosted on Instagram",
    contentTypes: ["Posts", "Reels", "Stories", "Livestreams"],
    icon: Camera,
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Video posts or livestreams uploaded to or hosted on TikTok",
    contentTypes: ["Video Posts", "Livestreams"],
    icon: Smartphone,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "Stories or spotlights uploaded to Snapchat",
    contentTypes: ["Stories", "Spotlights"],
    icon: MessageSquare,
  },
  {
    id: "x",
    name: "X",
    description: "Text, image, or video posts uploaded to X",
    contentTypes: ["Text Posts", "Image Posts", "Video Posts"],
    icon: Hash,
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Videos or shorts uploaded to a user's channel on YouTube",
    contentTypes: ["Videos", "Shorts"],
    icon: Monitor,
  },
  {
    id: "twitch",
    name: "Twitch",
    description: "Livestreams hosted on Twitch",
    contentTypes: ["Livestreams"],
    icon: Radio,
  },
];

const ActivityForm_SocialMedia = ({ nextStepUrl, onNext, currentActivity, totalActivities }) => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformContent, setPlatformContent] = useState({});
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (deal?.obligations?.['Social Media']) {
      const socialMediaData = deal.obligations['Social Media'];
      if (Array.isArray(socialMediaData)) {
        const converted = {};
        socialMediaData.forEach(item => {
          if (item.platform) {
            const platform = platforms.find(p => p.name.toLowerCase() === item.platform.toLowerCase());
            if (platform) {
              converted[platform.id] = platform.contentTypes.map(type => ({
                id: type.toLowerCase().replace(/\s+/g, "-"),
                name: type,
                quantity: item.quantity || 0,
              }));
            }
          }
        });
        setPlatformContent(converted);
        setSelectedPlatforms(Object.keys(converted));
      }
      setDescription(deal.obligations['Social Media'].description || "");
    }
  }, [deal]);

  const handlePlatformToggle = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
      const newPlatformContent = { ...platformContent };
      delete newPlatformContent[platformId];
      setPlatformContent(newPlatformContent);
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
      const platform = platforms.find(p => p.id === platformId);
      if (platform) {
        setPlatformContent({
          ...platformContent,
          [platformId]: platform.contentTypes.map(type => ({
            id: type.toLowerCase().replace(/\s+/g, "-"),
            name: type,
            quantity: 0,
          })),
        });
      }
    }
  };

  const updateContentQuantity = (platformId, contentId, quantity) => {
    setPlatformContent({
      ...platformContent,
      [platformId]: platformContent[platformId].map(content =>
        content.id === contentId ? { ...content, quantity: Math.max(0, quantity) } : content
      ),
    });
  };

  const getTotalContent = () => {
    return selectedPlatforms.reduce((total, platformId) => {
      return total + (platformContent[platformId]?.reduce((sum, content) => sum + content.quantity, 0) || 0);
    }, 0);
  };

  const isFormValid = () => {
    if (selectedPlatforms.length === 0) return false;
    return selectedPlatforms.some(platformId => 
      platformContent[platformId]?.some(content => content.quantity > 0)
    );
  };

  const handleNext = async () => {
    const formattedData = {
      platforms: selectedPlatforms.flatMap(platformId => {
        const platform = platforms.find(p => p.id === platformId);
        return platformContent[platformId]
          .filter(content => content.quantity > 0)
          .map(content => ({
            platform: platform.name,
            type: content.name,
            quantity: content.quantity,
          }));
      }),
      description,
    };

    await updateDeal(dealId, {
      obligations: {
        ...deal.obligations,
        'social-media': {
          ...deal.obligations?.['social-media'],
          ...formattedData,
        },
      },
    });
    
    onNext();
  };

  const progressPercentage = ((currentActivity - 1) / totalActivities) * 100;

  return (
    <Container maxW="4xl" py={6}>
      <Box
        borderWidth="1px"
        borderColor="brand.accentSecondary"
        shadow="xl"
        bg="white"
        rounded="xl"
        overflow="hidden"
      >
        {/* Header Section */}
        <Box
          p={8}
          pb={10}
          bgGradient="linear(to-r, brand.backgroundLight, white)"
        >
          {/* Progress Indicator */}
          <VStack spacing={4} mb={8}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="semibold">
                Activity {currentActivity} of {totalActivities}
              </Text>
              <Text color="brand.textSecondary">{progressPercentage.toFixed(1)}% Complete</Text>
            </Flex>
            <Box w="full" h="3" bg="brand.accentSecondary" opacity={0.3} rounded="full" overflow="hidden">
              <Box
                bg="brand.accentPrimary"
                h="full"
                w={`${progressPercentage}%`}
                rounded="full"
                transition="width 0.7s ease-out"
                bgGradient="linear(to-r, brand.accentPrimary, brand.accentPrimary)"
                shadow="sm"
              />
            </Box>
          </VStack>

          {/* Title Section */}
          <Flex gap={3} mb={selectedPlatforms.length > 0 ? 4 : 0}>
            <Box
              w="12"
              h="12"
              bg="brand.accentPrimary"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="lg"
            >
              <Icon as={Globe} w="6" h="6" color="white" />
            </Box>
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="brand.textPrimary">
                Social Media Details
              </Text>
              <Text fontSize="lg" color="brand.textSecondary">
                Configure your sponsored content requirements
              </Text>
            </Box>
          </Flex>

          {/* Status Badges */}
          {selectedPlatforms.length > 0 && (
            <Flex gap={2} mt={2}>
              <Badge
                px={3}
                py={1}
                bg="brand.accentPrimary"
                color="white"
                opacity={0.9}
                rounded="full"
              >
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
              </Badge>
              {getTotalContent() > 0 && (
                <Badge
                  px={3}
                  py={1}
                  bg="green.100"
                  color="green.700"
                  rounded="full"
                >
                  {getTotalContent()} piece{getTotalContent() !== 1 ? "s" : ""} of content
                </Badge>
              )}
            </Flex>
          )}
        </Box>

        {/* Content Section */}
        <Box p={8} pt={10} space={10}>
          <VStack spacing={10}>
            {/* Platform Selection */}
            <FormControl>
              <Flex justify="space-between" mb={6}>
                <FormLabel color="brand.textPrimary" fontSize="xl" fontWeight="bold" m={0}>
                  Select Platforms
                </FormLabel>
                <Text fontSize="sm" color="brand.textSecondary">
                  Choose where you'll post content
                </Text>
              </Flex>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <Box
                      key={platform.id}
                      borderWidth="2px"
                      borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                      rounded="2xl"
                      p={6}
                      cursor="pointer"
                      bg={isSelected ? "brand.backgroundLight" : "white"}
                      onClick={() => handlePlatformToggle(platform.id)}
                      transition="all 0.3s"
                      transform={isSelected ? "scale(1.02)" : "scale(1)"}
                      _hover={{
                        borderColor: "brand.accentPrimary",
                        bg: "brand.backgroundLight",
                        transform: "scale(1.02)",
                        shadow: "lg",
                      }}
                    >
                      <Flex align="start" justify="space-between">
                        <Flex gap={4}>
                          <Box
                            w="12"
                            h="12"
                            bg={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                            color={isSelected ? "white" : "brand.textSecondary"}
                            rounded="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            transition="all 0.3s"
                          >
                            <Icon as={platform.icon} w="5" h="5" />
                          </Box>
                          <Box flex="1">
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="brand.textPrimary"
                              mb={2}
                            >
                              {platform.name}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="brand.textSecondary"
                              lineHeight="relaxed"
                            >
                              {platform.description}
                            </Text>
                          </Box>
                        </Flex>
                        <Box
                          w="8"
                          h="8"
                          rounded="full"
                          bg={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                          color={isSelected ? "white" : "brand.textSecondary"}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="sm"
                          transform={isSelected ? "scale(1.1)" : "scale(1)"}
                          transition="all 0.2s"
                        >
                          <Icon as={isSelected ? Minus : Plus} w="4" h="4" />
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </Grid>
            </FormControl>

            {/* Content Requirements */}
            {selectedPlatforms.length > 0 && (
              <FormControl>
                <Flex justify="space-between" mb={6}>
                  <FormLabel color="brand.textPrimary" fontSize="xl" fontWeight="bold" m={0}>
                    Content Requirements
                  </FormLabel>
                  <Text fontSize="sm" color="brand.textSecondary">
                    Specify quantities for each content type
                  </Text>
                </Flex>

                <VStack spacing={4}>
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    const content = platformContent[platformId] || [];

                    return (
                      <Box
                        key={platformId}
                        w="full"
                        borderWidth="1px"
                        borderColor="brand.accentSecondary"
                        rounded="xl"
                        p={4}
                        bg="brand.backgroundLight"
                      >
                        <Flex align="center" gap={3} mb={4}>
                          <Box
                            w="8"
                            h="8"
                            bg="brand.accentSecondary"
                            rounded="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="brand.textSecondary"
                          >
                            <Icon as={platform.icon} w="4" h="4" />
                          </Box>
                          <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary">
                            {platform.name}
                          </Text>
                        </Flex>

                        <VStack spacing={3}>
                          {content.map((contentType) => (
                            <Flex
                              key={contentType.id}
                              justify="space-between"
                              align="center"
                              p={3}
                              bg="white"
                              rounded="lg"
                              borderWidth="1px"
                              borderColor="brand.accentSecondary"
                              opacity={0.9}
                            >
                              <Text fontWeight="medium" color="brand.textPrimary">
                                {contentType.name}
                              </Text>
                              <Flex align="center" gap={3}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  w="8"
                                  h="8"
                                  p="0"
                                  rounded="full"
                                  borderColor="brand.accentSecondary"
                                  onClick={() => updateContentQuantity(platformId, contentType.id, contentType.quantity - 1)}
                                  isDisabled={contentType.quantity <= 0}
                                  _hover={{
                                    bg: "brand.accentPrimary",
                                    color: "white",
                                    borderColor: "brand.accentPrimary",
                                  }}
                                >
                                  <Icon as={Minus} w="3" h="3" />
                                </Button>
                                <Text w="8" textAlign="center" fontWeight="bold" color="brand.textPrimary">
                                  {contentType.quantity}
                                </Text>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  w="8"
                                  h="8"
                                  p="0"
                                  rounded="full"
                                  borderColor="brand.accentSecondary"
                                  onClick={() => updateContentQuantity(platformId, contentType.id, contentType.quantity + 1)}
                                  _hover={{
                                    bg: "brand.accentPrimary",
                                    color: "white",
                                    borderColor: "brand.accentPrimary",
                                  }}
                                >
                                  <Icon as={Plus} w="3" h="3" />
                                </Button>
                              </Flex>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    );
                  })}
                </VStack>
              </FormControl>
            )}

            {/* Content Guidelines */}
            <FormControl>
              <Flex justify="space-between" mb={4}>
                <FormLabel htmlFor="description" color="brand.textPrimary" fontSize="xl" fontWeight="bold" m={0}>
                  Content Guidelines
                </FormLabel>
                <Text fontSize="sm" color="brand.textSecondary">
                  Optional but recommended
                </Text>
              </Flex>

              <Box position="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide specific instructions, hashtags, mentions, or content requirements. For example: 'Post a 60-second video reviewing the new protein powder, highlighting taste and effectiveness. Include #PowerUp hashtag and tag @BrandName. Use upbeat music and good lighting.'"
                  minH="140px"
                  rows={6}
                  fontSize="base"
                  borderWidth="2px"
                  borderColor="brand.accentSecondary"
                  bg="brand.backgroundLight"
                  rounded="xl"
                  p={4}
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                  resize="none"
                  maxLength={1000}
                />
                <Text
                  position="absolute"
                  bottom="3"
                  right="3"
                  fontSize="xs"
                  color="brand.textSecondary"
                >
                  {description.length}/1000
                </Text>
              </Box>
            </FormControl>

            {/* Navigation */}
            <Flex
              justify="space-between"
              align="center"
              pt={8}
              borderTopWidth="1px"
              borderColor="brand.accentSecondary"
              opacity={0.9}
            >
              <Button
                leftIcon={<Icon as={Clock} w="5" h="5" />}
                variant="ghost"
                h="12"
                px="6"
                fontSize="base"
                fontWeight="medium"
                color="brand.textSecondary"
                onClick={() => navigate('/dashboard')}
                rounded="xl"
                _hover={{
                  bg: "brand.backgroundLight",
                  color: "brand.textPrimary",
                }}
              >
                Finish Later
              </Button>

              <Flex gap={4}>
                <Button
                  leftIcon={<Icon as={ChevronLeft} w="5" h="5" />}
                  variant="outline"
                  h="12"
                  px="6"
                  fontSize="base"
                  fontWeight="semibold"
                  borderWidth="2px"
                  borderColor="brand.accentSecondary"
                  color="brand.textSecondary"
                  onClick={() => {
                    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
                    navigate(`/add/deal/activities/select/${dealId}${typeParam}`);
                  }}
                  rounded="xl"
                  _hover={{
                    bg: "brand.backgroundLight",
                    borderColor: "brand.accentPrimary",
                    color: "brand.textPrimary",
                  }}
                >
                  Back
                </Button>
                <Button
                  rightIcon={<Icon as={ChevronRight} w="5" h="5" />}
                  h="12"
                  px="8"
                  fontSize="base"
                  fontWeight="bold"
                  bg={isFormValid() ? "brand.accentPrimary" : "brand.accentSecondary"}
                  color="white"
                  isDisabled={!isFormValid()}
                  onClick={handleNext}
                  rounded="xl"
                  transition="all 0.3s"
                  _hover={
                    isFormValid()
                      ? {
                          transform: "scale(1.05)",
                          shadow: "xl",
                        }
                      : {}
                  }
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                >
                  Continue
                </Button>
              </Flex>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default ActivityForm_SocialMedia;