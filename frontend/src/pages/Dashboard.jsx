// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Button, Spinner, Text, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFMVContext } from '../context/FMVContext.jsx'; // CORRECTED: Import useFMVContext
import { supabase } from '../supabaseClient.js';
import DealsTable from '../components/DealsTable.jsx';
import SummaryCards from '../components/SummaryCards.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  // CORRECTED: Call the correct hook and get the correct function
  const { resetAndPrefill } = useFMVContext(); 
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch deals.');
        }

        const data = await response.json();
        setDeals(data);
      } catch (error) {
        toast({
          title: 'Error fetching deals.',
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
  }, [user, toast]);

  const handleNewDeal = () => {
    // CORRECTED: Call the renamed function to clear form state before navigating
    resetAndPrefill();
    navigate('/dashboard/new-deal');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          My Deals
        </Heading>
        <Button 
          colorScheme="pink" 
          bg="brand.accentPrimary" 
          color="white" 
          _hover={{ bg: '#c8aeb0' }}
          onClick={handleNewDeal}
        >
          New Deal Compliance Check
        </Button>
      </Flex>

      <SummaryCards deals={deals} />

      {deals.length > 0 ? (
        <DealsTable deals={deals} setDeals={setDeals} />
      ) : (
        <Flex justify="center" align="center" minH="40vh" borderWidth="2px" borderStyle="dashed" borderRadius="md" mt={8}>
            <Text fontSize="lg" color="gray.500">You have no deals yet. Start a new compliance check to add one!</Text>
        </Flex>
      )}
    </Box>
  );
};

export default Dashboard;