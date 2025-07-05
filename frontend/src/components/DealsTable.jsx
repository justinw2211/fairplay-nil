// frontend/src/components/DealsTable.jsx
import React, { useMemo, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon, DeleteIcon, HamburgerIcon } from '@chakra-ui/icons';
import StatusBadge from './StatusBadge';
import StatusMenu from './StatusMenu';
import { ResultBadges } from './ResultBadge';
import { supabase } from '../supabaseClient';

const DealsTable = ({ deals, setDeals, onDealDeleted }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const sortedDeals = useMemo(() => {
    let sortableDeals = [...deals];
    if (sortConfig.key !== null) {
      sortableDeals.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDeals;
  }, [deals, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <TriangleUpIcon aria-label="sorted ascending" /> : <TriangleDownIcon aria-label="sorted descending" />;
  };

  const handleStatusChange = (dealId, newStatus) => {
    setDeals(deals.map(deal => deal.id === dealId ? { ...deal, status: newStatus } : deal));
  };

  const openDeleteConfirm = (deal) => {
    setDealToDelete(deal);
    setIsAlertOpen(true);
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;

    setIsDeleting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete the deal.');
      }

      setDeals(deals.filter(deal => deal.id !== dealToDelete.id));
      toast({
        title: "Deal Deleted",
        description: `Deal with ${dealToDelete.brand_partner || dealToDelete.payor_name || 'N/A'} has been deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Call the callback to refresh the deals list
      if (onDealDeleted) {
        await onDealDeleted();
      }

    } catch(error) {
      toast({
        title: "Error Deleting Deal",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setDealToDelete(null);
    }
  };

  // Defensive function to prevent crashing on invalid dates
  const formatDate = (dateString) => {
    // Check for null, undefined, or empty string
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    // Check if the created date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => requestSort('brand_partner')}>Brand {getSortIcon('brand_partner')}</Th>
              <Th cursor="pointer" onClick={() => requestSort('fmv')}>FMV {getSortIcon('fmv')}</Th>
              <Th cursor="pointer" onClick={() => requestSort('status')}>Status {getSortIcon('status')}</Th>
              <Th>Analysis Results</Th>
              <Th cursor="pointer" onClick={() => requestSort('created_at')}>Date Added {getSortIcon('created_at')}</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedDeals.map((deal) => (
              <Tr key={deal.id}>
                <Td>{deal.brand_partner || deal.payor_name || 'N/A'}</Td>
                <Td>${deal.fmv ? deal.fmv.toFixed(2) : '0.00'}</Td>
                <Td>
                  <StatusMenu deal={deal} onStatusChange={handleStatusChange}>
                    <StatusBadge status={deal.status} />
                  </StatusMenu>
                </Td>
                <Td>
                  <ResultBadges deal={deal} />
                </Td>
                <Td>{formatDate(deal.created_at)}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<HamburgerIcon />}
                      variant='outline'
                    />
                    <MenuList>
                      <MenuItem 
                        icon={<DeleteIcon />}
                        color="red.500"
                        onClick={() => openDeleteConfirm(deal)}
                      >
                        Delete Deal
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Deal
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={4}>
                Are you sure you want to delete this deal with {dealToDelete?.brand_partner || dealToDelete?.payor_name || 'N/A'}?
              </Text>
              <Text fontSize="sm" color="gray.600">
                This action cannot be undone. All deal data and any analysis results will be permanently removed.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme='red' 
                onClick={handleDeleteDeal} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DealsTable;