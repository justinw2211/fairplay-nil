// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Flex, Heading, Button, Spinner, Text, VStack, useToast,
  HStack, Avatar, Badge, Divider, useColorModeValue, Icon,
  Tooltip, Card, CardBody, SimpleGrid
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useDeal } from '../context/DealContext';
// *** BUG FIX: Import the supabase client to make it available in this file ***
import { supabase } from '../supabaseClient';
import DealsTable from '../components/DealsTable';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiUser, FiAward, FiMapPin, FiPlus, FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi';
import SocialMediaModal from '../components/social-media-modal';
import useSocialMedia from '../hooks/use-social-media';
import DealTypeCard from '../components/DealTypeCard';

const ProfileCard = ({ user, onEditClick }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg" 
      overflow="hidden"
      mb={6}
    >
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Avatar 
              size="lg" 
              name={user?.full_name} 
              src={user?.avatar_url}
              bg="brand.accentPrimary"
            />
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">{user?.full_name}</Text>
                <Badge colorScheme="green">{user?.division || 'Athlete'}</Badge>
              </HStack>
              <HStack spacing={4} color="gray.600">
                <HStack>
                  <Icon as={FiMapPin} />
                  <Text>{user?.university || 'University'}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiAward} />
                  <Text>{user?.sport || 'Sport'}</Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
          <Tooltip label="Edit Profile" placement="top">
            <Button
              leftIcon={<FiEdit2 />}
              variant="outline"
              size="sm"
              onClick={onEditClick}
              borderColor="brand.accentPrimary"
              color="brand.accentPrimary"
              _hover={{
                bg: 'brand.accentPrimary',
                color: 'white'
              }}
            >
              Edit Profile
            </Button>
          </Tooltip>
        </Flex>
      </CardBody>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { createDraftDeal, loading: isCreatingDeal } = useDeal();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  
  // Social media modal state
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
  const [socialMediaCheckComplete, setSocialMediaCheckComplete] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState(null);
  const { fetchSocialMedia } = useSocialMedia();

  // Check if user needs to complete social media profile
  useEffect(() => {
    const checkSocialMediaCompletion = async () => {
      if (!user || socialMediaCheckComplete) return;
      
      try {
        const data = await fetchSocialMedia();
        setSocialMediaData(data);
        setSocialMediaCheckComplete(true);
        
        // Show modal if user has no social media platforms configured
        if (!data || data.length === 0) {
          setShowSocialMediaModal(true);
        }
      } catch (error) {
        console.error('Error checking social media completion:', error);
        setSocialMediaCheckComplete(true);
      }
    };

    checkSocialMediaCompletion();
  }, [user, fetchSocialMedia, socialMediaCheckComplete]);

  const handleSocialMediaComplete = async () => {
    setShowSocialMediaModal(false);
    // Refresh social media data after completion
    try {
      const data = await fetchSocialMedia();
      setSocialMediaData(data);
    } catch (error) {
      console.error('Error refreshing social media data:', error);
    }
  };

  const handleSkipSocialMedia = () => {
    setShowSocialMediaModal(false);
  };

  const fetchDeals = useCallback(async () => {
    const sessionRes = await supabase.auth.getSession();
    const token = sessionRes.data.session?.access_token;

    if (!token) {
      toast({ 
        title: "Authentication Error", 
        description: "Could not get user session. Please log in again.", 
        status: "error" 
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("API endpoint not found. Please verify the VITE_API_URL environment variable.");
        }
        throw new Error("Failed to fetch deals from the server.");
      }
      
      const data = await response.json();
      setDeals(data.deals || []); // Handle the new response format
    } catch (error) {
      toast({
        title: 'Error Fetching Deals',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);
  
  const handleDealTypeSelect = async (dealType) => {
    try {
      const newDeal = await createDraftDeal({ deal_type: dealType });
      if (!newDeal) {
        throw new Error('Failed to create new deal');
      }
      
      // Navigate to the appropriate workflow based on deal type
      switch (dealType) {
        case 'simple':
          navigate(`/add/deal/social-media/${newDeal.id}?type=simple`);
          break;
        case 'clearinghouse':
          navigate(`/add/deal/social-media/${newDeal.id}?type=clearinghouse`);
          break;
        case 'valuation':
          navigate(`/add/deal/social-media/${newDeal.id}?type=valuation`);
          break;
        default:
          navigate(`/add/deal/social-media/${newDeal.id}`);
      }
      
      // Refresh the deals list after creating a new deal
      await fetchDeals();
    } catch (error) {
      toast({
        title: 'Error Creating Deal',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDealDeleted = async () => {
    // Refresh the deals list after deletion
    await fetchDeals();
  };

  const draftDeals = deals.filter(deal => deal.status === 'draft');
  const submittedDeals = deals.filter(deal => deal.status !== 'draft');

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const dealTypes = [
    {
      id: 'simple',
      title: 'Simple Deal Logging',
      description: 'Basic deal tracking without predictive analysis. Perfect for straightforward deals where you just need status management.',
      icon: FiFileText
    },
    {
      id: 'clearinghouse',
      title: 'NIL Go Clearinghouse Check',
      description: 'Get a prediction on whether your deal will be approved, denied, or flagged by the NIL Go Clearinghouse.',
      icon: FiShield
    },
    {
      id: 'valuation',
      title: 'Deal Valuation Analysis',
      description: 'Receive fair market value compensation ranges based on your deal parameters and athlete profile.',
      icon: FiTrendingUp
    }
  ];

  if (loading) {
    return (<Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>);
  }

  return (
    <Box p={8}>
      <ProfileCard user={user} onEditClick={handleEditProfile} />
      
      <VStack spacing={8} mb={8}>
        <VStack spacing={2}>
          <Heading as="h2" size="lg" textAlign="center">Create New Deal</Heading>
          <Text color="gray.500" textAlign="center">Choose the type of deal analysis you'd like to perform</Text>
        </VStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full" justifyItems="center">
          {dealTypes.map((dealType) => (
            <DealTypeCard
              key={dealType.id}
              title={dealType.title}
              description={dealType.description}
              icon={dealType.icon}
              onClick={() => handleDealTypeSelect(dealType.id)}
              isLoading={isCreatingDeal}
            />
          ))}
        </SimpleGrid>
      </VStack>
      
      <Box mb={10}>
        <Heading as="h3" size="md" mb={4}>Draft Deals</Heading>
        {draftDeals.length > 0 ? (
          <DealsTable 
            deals={draftDeals} 
            setDeals={setDeals} 
            onDealDeleted={handleDealDeleted}
          />
        ) : (
          <Text>You have no deals currently in progress. Choose a deal type above to get started.</Text>
        )}
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={4}>Submitted Deals</Heading>
        {submittedDeals.length > 0 ? (
          <DealsTable 
            deals={submittedDeals} 
            setDeals={setDeals}
            onDealDeleted={handleDealDeleted}
          />
        ) : (
          <Text>You have not submitted any deals yet.</Text>
        )}
      </Box>

      {/* Social Media Modal */}
      <SocialMediaModal
        isOpen={showSocialMediaModal}
        onClose={handleSkipSocialMedia}
        onComplete={handleSocialMediaComplete}
      />
    </Box>
  );
};

export default Dashboard;