// frontend/src/pages/DealWizard/ActivityForm_SocialMedia.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Text,
  VStack,
  Textarea,
} from '@chakra-ui/react';
import { Plus, Minus, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import SurveyLayout from './SurveyLayout';

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Posts, reels, stories, or livestreams uploaded to or hosted on Instagram",
    contentTypes: ["Posts", "Reels", "Stories", "Livestreams"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Video posts or livestreams uploaded to or hosted on TikTok",
    contentTypes: ["Video Posts", "Livestreams"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "Stories or spotlights uploaded to Snapchat",
    contentTypes: ["Stories", "Spotlights"],
  },
  {
    id: "x",
    name: "X",
    description: "Text, image, or video posts uploaded to X",
    contentTypes: ["Text Posts", "Image Posts", "Video Posts"],
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Videos or shorts uploaded to a user's channel on YouTube",
    contentTypes: ["Videos", "Shorts"],
  },
  {
    id: "twitch",
    name: "Twitch",
    description: "Livestreams hosted on Twitch",
    contentTypes: ["Livestreams"],
  },
];

const ActivityForm_SocialMedia = ({ nextStepUrl }) => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();

  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformContent, setPlatformContent] = useState({});
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (deal?.obligations?.['Social Media']) {
      const socialMediaData = deal.obligations['Social Media'];
      // Convert existing data to new format if needed
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

  const isFormValid = () => {
    if (selectedPlatforms.length === 0) return false;
    return selectedPlatforms.some(platformId => 
      platformContent[platformId]?.some(content => content.quantity > 0)
    );
  };

  const handleNext = async () => {
    // Convert the new format back to the expected format for the API
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
        'Social Media': formattedData,
      },
    });
    navigate(nextStepUrl);
  };

  return (
    <SurveyLayout
      currentStep={4}
      totalSteps={8}
      title="Activity Details: Social Media"
      description="Sponsored photo or video posted to your personal social media account."
      isNextDisabled={!isFormValid()}
      onNext={handleNext}
      backUrl={`/add/deal/activities/select/${dealId}`}
    >
      <VStack spacing={8} align="stretch">
        {/* Platform Selection */}
        <FormControl>
          <FormLabel color="brand.textPrimary" fontWeight="semibold">
            Select Platforms *
          </FormLabel>
          <VStack spacing={3} align="stretch">
            {platforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <Box
                  key={platform.id}
                  border="1px"
                  borderColor={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                  rounded="lg"
                  p={4}
                  cursor="pointer"
                  bg={isSelected ? "brand.backgroundLight" : "white"}
                  onClick={() => handlePlatformToggle(platform.id)}
                  _hover={{
                    borderColor: "brand.accentPrimary",
                    bg: "brand.backgroundLight",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Box flex="1">
                      <Text fontWeight="semibold" color="brand.textPrimary">
                        {platform.name}
                      </Text>
                      <Text fontSize="sm" color="brand.textSecondary" mt={1}>
                        {platform.description}
                      </Text>
                    </Box>
                    <Button
                      variant="ghost"
                      size="sm"
                      w="8"
                      h="8"
                      rounded="full"
                      p="0"
                      bg={isSelected ? "brand.accentPrimary" : "brand.accentSecondary"}
                      color={isSelected ? "white" : "brand.textSecondary"}
                      _hover={{
                        bg: isSelected ? "brand.accentPrimary" : "brand.accentPrimary",
                        color: "white",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlatformToggle(platform.id);
                      }}
                    >
                      <Icon as={isSelected ? Minus : Plus} boxSize={4} />
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </FormControl>

        {/* Content Type Quantities for Selected Platforms */}
        {selectedPlatforms.map((platformId) => {
          const platform = platforms.find((p) => p.id === platformId);
          const content = platformContent[platformId] || [];

          return (
            <Box
              key={platformId}
              p={6}
              bg="brand.backgroundLight"
              rounded="lg"
              border="1px"
              borderColor="brand.accentSecondary"
            >
              <Text fontWeight="semibold" color="brand.textPrimary" fontSize="lg" mb={4}>
                {platform?.name} Content
              </Text>
              <VStack spacing={4} align="stretch">
                {content.map((contentType) => (
                  <Flex key={contentType.id} justify="space-between" align="center">
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
                        borderColor="brand.accentSecondary"
                        onClick={() => updateContentQuantity(platformId, contentType.id, contentType.quantity - 1)}
                        isDisabled={contentType.quantity <= 0}
                      >
                        <Icon as={Minus} boxSize={4} />
                      </Button>
                      <Text w="12" textAlign="center" fontWeight="medium" color="brand.textPrimary">
                        {contentType.quantity}
                      </Text>
                      <Button
                        variant="outline"
                        size="sm"
                        w="8"
                        h="8"
                        p="0"
                        borderColor="brand.accentSecondary"
                        onClick={() => updateContentQuantity(platformId, contentType.id, contentType.quantity + 1)}
                      >
                        <Icon as={Plus} boxSize={4} />
                      </Button>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            </Box>
          );
        })}

        {/* Description/Instructions Textarea */}
        <FormControl>
          <FormLabel color="brand.textPrimary" fontWeight="semibold">
            Description or Specific Instructions (optional)
          </FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'Post a 60-second video reviewing the new protein powder, highlighting taste and effectiveness. Include #PowerUp hashtag and tag @BrandName.'"
            minH="120px"
            rows={5}
            fontSize="base"
            borderColor="brand.accentSecondary"
            _focus={{
              borderColor: "brand.accentPrimary",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
            }}
            resize="none"
          />
        </FormControl>
      </VStack>
    </SurveyLayout>
  );
};

export default ActivityForm_SocialMedia;