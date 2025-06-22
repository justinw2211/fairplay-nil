// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Spinner, Flex, Button, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js'; // Also good practice to ensure .js is here
import { supabase } from '../supabaseClient.js';
import DealsTable from '../components/DealsTable.jsx'; // FIX: Added .jsx extension
import SummaryCards from '../components/SummaryCards.jsx'; // FIX: Added .jsx extension

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for delete confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dealToDelete, setDealToDelete] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("You must be logged in to view deals.");
        }
        
        // This logic is now handled by the backend API and RLS
        // We will call our new API endpoint instead
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeals(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Error fetching deals", description: err.message, status: 'error', duration: 5000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchDeals();
    } else {
        setLoading(false);
    }
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
        toast({ title: "Status Updated", status: 'success', duration: 2000, isClosable: true });
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
      toast({ title: "Deal Deleted", status: 'success', duration: 2000, isClosable: true });
      onClose();
      setDealToDelete(null);
    } catch (err) {
      toast({ title: "Error deleting deal", description: err.message, status: 'error' });
    }
  };

  if (loading) {
    return <Flex justify="center" align="center" h="80vh"><Spinner size="xl" /></Flex>;
  }

  if (error) {
    return <Box p={8}><Heading>Error</Heading><Text>{error}</Text></Box>;
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>Your Dashboard</Heading>
        <Button onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
      </Flex>

      <SummaryCards deals={deals} />

      <Box mt={10}>
        {deals.length === 0 ? (
          <Flex direction="column" align="center" justify="center" bg="gray.50" p={10} borderRadius="lg" textAlign="center">
            <Heading as="h3" size="md">Welcome, {user?.user_metadata?.full_name || user?.email}!</Heading>
            <Text mt={2} color="gray.600">You haven't calculated any deals yet.</Text>
            <Button mt={4} onClick={() => navigate('/fmvcalculator/step1')}>Calculate Your First FMV</Button>
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