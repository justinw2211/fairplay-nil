// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Flex, Heading, Button, Spinner, Text, VStack, useToast,
  HStack, Avatar, Badge, Divider, useColorModeValue, Icon,
  Tooltip, Card, CardBody, SimpleGrid, Tabs, TabList, TabPanels, 
  Tab, TabPanel, Container, useBreakpointValue
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useDeal } from '../context/DealContext';
// *** BUG FIX: Import the supabase client to make it available in this file ***
import { supabase } from '../supabaseClient';
import DealsTable from '../components/DealsTable';
import SummaryCards from '../components/SummaryCards';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiUser, FiAward, FiMapPin, FiPlus, FiFileText, FiShield, FiTrendingUp, FiBarChart } from 'react-icons/fi';
import SocialMediaModal from '../components/social-media-modal';
import useSocialMedia from '../hooks/use-social-media';
import DealTypeCard from '../components/DealTypeCard';
import AnalyticsTab from '../components/AnalyticsTab';
import ProfileBanner from '../components/ProfileBanner';
import useProfile from '../hooks/useProfile';
import ErrorBoundary from '../components/ErrorBoundary';

// ProfileCard component removed - replaced with enhanced ProfileBanner

// Create New Deal Section Component
const CreateDealSection = ({ onDealTypeSelect, isCreatingDeal }) => {
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

  return (
    <VStack spacing={8} mb={8}>
      <VStack spacing={2}>
        <Heading as="h2" size="lg" textAlign="center" color="brand.textPrimary">Create New Deal</Heading>
        <Text color="brand.textSecondary" textAlign="center">Choose the type of deal analysis you'd like to perform</Text>
      </VStack>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full" justifyItems="center">
        {dealTypes.map((dealType) => (
          <DealTypeCard
            key={dealType.id}
            title={dealType.title}
            description={dealType.description}
            icon={dealType.icon}
            onClick={() => onDealTypeSelect(dealType.id)}
            isLoading={isCreatingDeal}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

// Active Deals Tab Component
const ActiveDealsTab = ({ deals, setDeals, onDealDeleted, onDealTypeSelect, isCreatingDeal }) => {
  const activeDeals = deals.filter(deal => deal.status !== 'draft');

  return (
    <VStack spacing={6} align="stretch">
      <SummaryCards deals={activeDeals} />
      
      <CreateDealSection 
        onDealTypeSelect={onDealTypeSelect} 
        isCreatingDeal={isCreatingDeal} 
      />
      
      <Box>
        <Heading as="h3" size="md" mb={4} color="brand.textPrimary">Active Deals</Heading>
        {activeDeals.length > 0 ? (
          <DealsTable 
            deals={activeDeals} 
            setDeals={setDeals}
            onDealDeleted={onDealDeleted}
          />
        ) : (
          <Card bg="brand.backgroundLight" p={6}>
            <Text textAlign="center" color="brand.textSecondary">
              No active deals yet. Create your first deal above to get started.
            </Text>
          </Card>
        )}
      </Box>
    </VStack>
  );
};

// Drafts Tab Component
const DraftsTab = ({ deals, setDeals, onDealDeleted }) => {
  const draftDeals = deals.filter(deal => deal.status === 'draft');

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading as="h3" size="md" mb={4} color="brand.textPrimary">Draft Deals</Heading>
        <Text color="brand.textSecondary" mb={4}>
          Complete your draft deals to activate them and start tracking progress.
        </Text>
        {draftDeals.length > 0 ? (
          <DealsTable 
            deals={draftDeals} 
            setDeals={setDeals} 
            onDealDeleted={onDealDeleted}
          />
        ) : (
          <Card bg="brand.backgroundLight" p={6}>
            <Text textAlign="center" color="brand.textSecondary">
              No draft deals found. Start creating a new deal from the Active Deals tab.
            </Text>
          </Card>
        )}
      </Box>
    </VStack>
  );
};

// Analytics Tab Component - now using comprehensive implementation from ../components/AnalyticsTab

const Dashboard = () => {
  const { user } = useAuth();
  const { createDraftDeal, loading: isCreatingDeal } = useDeal();
  const { profile, loading: profileLoading, error: profileError, fetchProfile } = useProfile();
  const { fetchSocialMedia: loadSocialMediaData } = useSocialMedia();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [socialMediaCount, setSocialMediaCount] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();
  
  // Social media modal state
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
  const [socialMediaCheckComplete, setSocialMediaCheckComplete] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState(null);

  // Responsive values
  const tabSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const containerMaxW = useBreakpointValue({ base: 'full', lg: '7xl' });

  // Check if user needs to complete social media profile
  useEffect(() => {
    const checkSocialMediaCompletion = async () => {
      if (!user || socialMediaCheckComplete) return;
      
      try {
        const data = await loadSocialMediaData();
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
  }, [user, loadSocialMediaData, socialMediaCheckComplete]);

  const handleSocialMediaComplete = async () => {
    setShowSocialMediaModal(false);
    // Refresh social media data after completion
    try {
      const data = await loadSocialMediaData();
      setSocialMediaData(data);
      // Also update the social media count for the banner
      setSocialMediaCount(data?.length || 0);
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
          console.warn("Backend API not available. Using empty data for development.");
          setDeals([]); // Set empty deals array for development
          return;
        }
        throw new Error("Failed to fetch deals from the server.");
      }
      
      const data = await response.json();
      setDeals(data.deals || []); // Handle the new response format
    } catch (error) {
      // Handle network errors gracefully for development
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.warn("Backend API not available. Using empty data for development.");
        setDeals([]); // Set empty deals array for development
      } else {
        toast({
          title: 'Error Fetching Deals',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDeals();
    
    // Fetch profile data on mount
    if (user) {
      fetchProfile().catch(error => {
        console.error('Error fetching profile on dashboard mount:', error);
      });
    }
  }, [fetchDeals, fetchProfile, user]);

  // Fetch social media count for the profile banner
  useEffect(() => {
    const fetchSocialMediaCount = async () => {
      try {
        const socialMediaData = await loadSocialMediaData();
        setSocialMediaCount(socialMediaData?.length || 0);
      } catch (error) {
        console.error('Error fetching social media count:', error);
        setSocialMediaCount(0);
      }
    };

    if (user) {
      fetchSocialMediaCount();
    }
  }, [user, loadSocialMediaData]);
  
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
      // Handle backend not available for development
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        toast({
          title: 'Backend Not Available',
          description: 'The backend API is not running. Please start the backend server to create deals.',
          status: 'warning',
          duration: 7000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error Creating Deal',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleDealDeleted = async () => {
    // Refresh the deals list after deletion
    await fetchDeals();
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="brand.accentPrimary" />
      </Flex>
    );
  }

  return (
    <Container maxW={containerMaxW} p={{ base: 4, md: 8 }}>
      <ErrorBoundary context="Profile">
        <ProfileBanner 
          profile={profile || user} 
          loading={profileLoading}
          error={profileError}
          onEditClick={handleEditProfile}
          onRetry={fetchProfile}
          showSocialMedia={true}
          socialMediaCount={socialMediaCount}
        />
      </ErrorBoundary>
      
      <Tabs 
        index={activeTab} 
        onChange={setActiveTab}
        variant="enclosed"
        colorScheme="brand"
        size={tabSize}
      >
        <TabList mb={6} borderColor="brand.accentSecondary">
          <Tab 
            _selected={{ 
              bg: 'brand.accentPrimary', 
              color: 'white',
              borderColor: 'brand.accentPrimary' 
            }}
            color="brand.textSecondary"
          >
            Active Deals
          </Tab>
          <Tab 
            _selected={{ 
              bg: 'brand.accentPrimary', 
              color: 'white',
              borderColor: 'brand.accentPrimary' 
            }}
            color="brand.textSecondary"
          >
            Drafts
          </Tab>
          <Tab 
            _selected={{ 
              bg: 'brand.accentPrimary', 
              color: 'white',
              borderColor: 'brand.accentPrimary' 
            }}
            color="brand.textSecondary"
          >
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <ActiveDealsTab 
              deals={deals}
              setDeals={setDeals}
              onDealDeleted={handleDealDeleted}
              onDealTypeSelect={handleDealTypeSelect}
              isCreatingDeal={isCreatingDeal}
            />
          </TabPanel>
          
          <TabPanel p={0}>
            <DraftsTab 
              deals={deals}
              setDeals={setDeals}
              onDealDeleted={handleDealDeleted}
            />
          </TabPanel>
          
          <TabPanel p={0}>
            <AnalyticsTab deals={deals} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Social Media Modal */}
      <SocialMediaModal
        isOpen={showSocialMediaModal}
        onClose={handleSkipSocialMedia}
        onComplete={handleSocialMediaComplete}
      />
    </Container>
  );
};

export default Dashboard;