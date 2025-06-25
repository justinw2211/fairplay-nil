// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, Button, Spinner, Text, VStack, useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useDeal } from '../context/DealContext';
// *** BUG FIX: Import the supabase client to make it available in this file ***
import { supabase } from '../supabaseClient';
import DealsTable from '../components/DealsTable';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { createDraftDeal, loading: isCreatingDeal } = useDeal();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      // Now that 'supabase' is imported, this call will succeed.
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        toast({ title: "Authentication Error", description: "Could not get user session. Please log in again.", status: "error" });
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
        setDeals(data);
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
    };
    fetchDeals();
  }, [toast]);
  
  const handleAddNewDeal = async () => {
    await createDraftDeal();
  };

  const draftDeals = deals.filter(deal => deal.status === 'draft');
  const submittedDeals = deals.filter(deal => deal.status !== 'draft');

  if (loading) {
    return (<Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>);
  }

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="flex-start">
          <Heading as="h1" size="lg">Welcome, {user?.full_name || 'Athlete'}</Heading>
          <Text color="gray.500">Manage your NIL deals and track your earnings.</Text>
        </VStack>
        <Button 
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
        <Heading as="h2" size="md" mb={4}>Draft Deals</Heading>
        {draftDeals.length > 0 ? (
          <DealsTable deals={draftDeals} setDeals={setDeals} />
        ) : (
          <Text>You have no deals currently in progress. Click "Add New Deal" to get started.</Text>
        )}
      </Box>

      <Box>
        <Heading as="h2" size="md" mb={4}>Submitted Deals</Heading>
        {submittedDeals.length > 0 ? (
          <DealsTable deals={submittedDeals} setDeals={setDeals} />
        ) : (
          <Text>You have not submitted any deals yet.</Text>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;