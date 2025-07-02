// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Flex, Heading, Button, Spinner, Text, VStack, useToast,
  HStack, Avatar, Badge, Divider, useColorModeValue, Icon,
  Tooltip, Card, CardBody
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useDeal } from '../context/DealContext';
// *** BUG FIX: Import the supabase client to make it available in this file ***
import { supabase } from '../supabaseClient';
import DealsTable from '../components/DealsTable';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiUser, FiAward, FiMapPin } from 'react-icons/fi';

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
  
  const handleAddNewDeal = async () => {
    try {
      const newDeal = await createDraftDeal();
      if (!newDeal) {
        throw new Error('Failed to create new deal');
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

  if (loading) {
    return (<Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>);
  }

  return (
    <Box p={8}>
      <ProfileCard user={user} onEditClick={handleEditProfile} />
      
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="flex-start">
          <Heading as="h2" size="lg">Your NIL Deals</Heading>
          <Text color="gray.500">Manage your deals and track your earnings.</Text>
        </VStack>
        <Button 
          leftIcon={<Icon as={FiEdit2} />}
          colorScheme="pink" 
          bg="brand.accentPrimary" 
          color="white" 
          onClick={handleAddNewDeal}
          isLoading={isCreatingDeal}
          _hover={{ bg: '#c8aeb0' }}
        >
          Add New Deal
        </Button>
      </Flex>
      
      <Box mb={10}>
        <Heading as="h3" size="md" mb={4}>Draft Deals</Heading>
        {draftDeals.length > 0 ? (
          <DealsTable 
            deals={draftDeals} 
            setDeals={setDeals} 
            onDealDeleted={handleDealDeleted}
          />
        ) : (
          <Text>You have no deals currently in progress. Click "Add New Deal" to get started.</Text>
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
    </Box>
  );
};

export default Dashboard;