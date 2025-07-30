// src/components/SummaryCards.jsx
import React, { useState, useEffect } from 'react';
import {
  SimpleGrid, Text, Card, CardBody, Icon, VStack, HStack, useColorModeValue,
  Progress, Badge
} from '@chakra-ui/react';
import { FiDollarSign, FiTrendingUp, FiClock, FiAlertTriangle, FiArrowUp, FiArrowDown, FiUsers, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import useSocialMedia from '../hooks/use-social-media';

const SummaryCards = ({ deals }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('brand.backgroundLight', 'gray.700');
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [socialMediaLoading, setSocialMediaLoading] = useState(false);
  const { fetchSocialMedia } = useSocialMedia();

  // Fetch social media data
  useEffect(() => {
    const loadSocialMedia = async () => {
      setSocialMediaLoading(true);
      try {
        const data = await fetchSocialMedia();
        setSocialMediaData(data || []);
      } catch (error) {
        console.error('Error fetching social media data:', error);
        setSocialMediaData([]);
      } finally {
        setSocialMediaLoading(false);
      }
    };

    loadSocialMedia();
  }, [fetchSocialMedia]);

  // Ensure deals is always a valid array
  const safeDeals = React.useMemo(() => {
    if (!deals || !Array.isArray(deals)) {
      return [];
    }
    // Filter out any invalid deal objects
    return deals.filter(deal => deal && typeof deal === 'object');
  }, [deals]);

  // Calculate statistics
  const totalValue = safeDeals.reduce((sum, deal) => sum + (deal.fmv || 0), 0);
  const activeDeals = safeDeals.filter(deal => deal.status === 'active' || deal.status === 'Active').length;
  const completedDeals = safeDeals.filter(deal => deal.status === 'completed').length;
  const draftDeals = safeDeals.filter(deal => deal.status === 'draft').length;
  const totalDeals = safeDeals.length;

  // Calculate average deal value
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  // Calculate social media statistics
  const totalFollowers = socialMediaData.reduce((total, platform) => {
    return total + (parseInt(platform.followers) || 0);
  }, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return FiInstagram;
      case 'twitter':
        return FiTwitter;
      case 'tiktok':
        return FiYoutube; // Using YouTube icon for TikTok
      default:
        return FiUsers;
    }
  };

  // Enhanced summary card component
  const SummaryCard = ({ title, value, icon, color, helpText, trend, onClick, children }) => (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.3s ease"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: 'brand.accentPrimary'
      }}
      onClick={onClick}
    >
      <CardBody p={6}>
        <HStack justify="space-between" align="start" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={icon} color={color} boxSize="20px" />
              <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                {title}
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
              {value}
            </Text>
          </VStack>
          {trend && (
            <Badge colorScheme={trend > 0 ? 'green' : 'red'} variant="subtle">
              <HStack spacing={1}>
                <Icon as={trend > 0 ? FiArrowUp : FiArrowDown} boxSize="10px" />
                <Text fontSize="xs">{Math.abs(trend)}%</Text>
              </HStack>
            </Badge>
          )}
        </HStack>
        {helpText && (
          <Text fontSize="sm" color="brand.textSecondary" mb={2}>
            {helpText}
          </Text>
        )}
        {children}
      </CardBody>
    </Card>
  );

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
      <SummaryCard
        title="Total Deal Value"
        value={formatCurrency(totalValue)}
        icon={FiDollarSign}
        color="brand.accentPrimary"
        helpText={`Average: ${formatCurrency(avgDealValue)}`}
      />

      <SummaryCard
        title="Active Deals"
        value={activeDeals}
        icon={FiTrendingUp}
        color="green.500"
        helpText={`${completedDeals} completed deals`}
      >
        <Progress
          value={totalDeals > 0 ? (activeDeals / totalDeals) * 100 : 0}
          colorScheme="green"
          size="sm"
          borderRadius="full"
        />
      </SummaryCard>

      <SummaryCard
        title="Social Media Followers"
        value={socialMediaLoading ? "..." : formatFollowerCount(totalFollowers)}
        icon={FiUsers}
        color="purple.500"
        helpText={`${socialMediaData.length} platform${socialMediaData.length !== 1 ? 's' : ''}`}
      >
        {socialMediaData.length > 0 && (
          <VStack spacing={2} mt={2} align="start">
            {socialMediaData.map((platform, index) => (
              <HStack key={index} spacing={2} w="full" justify="space-between">
                <HStack spacing={2}>
                  <Icon as={getPlatformIcon(platform.platform)} color="purple.500" boxSize="14px" />
                  <Text fontSize="xs" color="brand.textSecondary" textTransform="capitalize">
                    {platform.platform}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="brand.textPrimary" fontWeight="medium">
                  {formatFollowerCount(platform.followers || 0)}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
        {socialMediaData.length === 0 && !socialMediaLoading && (
          <Text fontSize="xs" color="brand.textSecondary" mt={2}>
            No social media platforms connected
          </Text>
        )}
      </SummaryCard>

      <SummaryCard
        title="Draft Deals"
        value={draftDeals}
        icon={FiClock}
        color="orange.500"
        helpText={draftDeals > 0 ? "Needs attention" : "All caught up"}
      >
        {draftDeals > 0 && (
          <HStack spacing={2} mt={2}>
            <Icon as={FiAlertTriangle} color="orange.500" boxSize="16px" />
            <Text fontSize="xs" color="orange.500">
              Complete drafts to activate
            </Text>
          </HStack>
        )}
      </SummaryCard>
    </SimpleGrid>
  );
};

export default SummaryCards;