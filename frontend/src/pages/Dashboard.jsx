// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, Button, Spinner, Text, VStack, useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
// *** Import the useDeal hook to create new drafts ***
import { useDeal } from '../context/DealContext';
import { supabase } from '../supabaseClient';
import DealsTable from '../components/DealsTable';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  // *** Use our new DealContext functions ***
  const { createDraftDeal, loading: isCreatingDeal } = useDeal();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch all deals (drafts and submitted) when the component mounts
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch deals.");
        const data = await response.json();
        setDeals(data);
      } catch (error) {
        toast({
          title: 'Error fetching deals',
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
  
  // *** This new function handles the creation of a new draft deal ***
  const handleAddNewDeal = async () => {
    await createDraftDeal();
    // The createDraftDeal function will handle navigation automatically
  };

  // Filter deals into drafts and submitted
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
      
      {/* Drafts Section */}
      <Box mb={10}>
        <Heading as="h2" size="md" mb={4}>Draft Deals</Heading>
        {draftDeals.length > 0 ? (
          // In a future step, we can make this table more draft-specific
          // For now, re-using DealsTable is efficient.
          <DealsTable deals={draftDeals} setDeals={setDeals} />
        ) : (
          <Text>You have no deals currently in progress. Click "Add New Deal" to get started.</Text>
        )}
      </Box>

      {/* Submitted Deals Section */}
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