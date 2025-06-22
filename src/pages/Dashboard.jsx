// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Spinner, Flex, Button, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFMV } from '../context/FMVContext.jsx'; // Import useFMV hook
import { supabase } from '../supabaseClient.js';
import DealsTable from '../components/DealsTable.jsx';
import SummaryCards from '../components/SummaryCards.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { initializeNewCalculation } = useFMV(); // Get the pre-fill function
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dealToDelete, setDealToDelete] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeals(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Error fetching deals", description: err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [toast, user]);

  const handleStatusUpdate = async (dealId, newStatus) => {
    try {
        const { data, error } = await supabase
            .from('deals')
            .update({ status: newStatus })
            .eq('id', dealId)
            .select()
            .single();

        if (error) throw error;

        setDeals(deals.map(d => d.id === dealId ? data : d));
        toast({ title: "Status Updated", status: 'success', duration: 2000 });
    } catch (err) {
        toast({ title: "Error updating status", description: err.message, status: 'error' });
    }
  };

  const openDeleteModal = (deal) => {
    setDealToDelete(deal);
    onOpen();
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealToDelete.id);

      if (error) throw error;

      setDeals(deals.filter(d => d.id !== dealToDelete.id));
      toast({ title: "Deal Deleted", status: 'success', duration: 2000 });
      onClose();
      setDealToDelete(null);
    } catch (err) {
      toast({ title: "Error deleting deal", description: err.message, status: 'error' });
    }
  };
  
  // THE FIX: Create a handler that exactly mirrors the working buttons
  const handleStartCalculation = async () => {
    await initializeNewCalculation();
    navigate('/fmvcalculator/step1');
  };


  if (loading && !deals.length) {
    return <Flex justify="center" align="center" h="80vh"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>Your Dashboard</Heading>
        <Button onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
      </Flex>

      <SummaryCards deals={deals} />

      <Box mt={10}>
        {deals.length === 0 && !loading ? (
          <Flex direction="column" align="center" justify="center" bg="gray.50" p={10} borderRadius="lg" textAlign="center">
            <Heading as="h3" size="md">Welcome, {user?.user_metadata?.full_name || user?.email}!</Heading>
            <Text mt={2} color="gray.600">You haven't calculated any deals yet.</Text>
            {/* THE FIX: Use the new handler for the onClick event */}
            <Button mt={4} onClick={handleStartCalculation}>Calculate Your First FMV</Button>
          </Flex>
        ) : (
          <DealsTable deals={deals} onStatusUpdate={handleStatusUpdate} onDelete={openDeleteModal} />
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete the deal with "{dealToDelete?.brand_partner}"? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteDeal}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}