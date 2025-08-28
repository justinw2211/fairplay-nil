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
  Text,
  Checkbox,
  VStack,
  Tooltip,
  Input,
  Select,
  ButtonGroup,
  useDisclosure,
  Flex,
  Spacer,
  Divider
} from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  DeleteIcon,
  HamburgerIcon,
  EditIcon,
  ViewIcon,
  CheckIcon,
  CloseIcon
} from '@chakra-ui/icons';
import StatusBadge from './StatusBadge';
import StatusMenu from './StatusMenu';
import { ResultBadges } from './ResultBadge';
import { supabase } from '../supabaseClient';

const DealsTable = ({ deals, setDeals, onDealDeleted, onDealUpdated }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [selectedDeals, setSelectedDeals] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [dealToDelete, setDealToDelete] = useState(null);
  const [labelFilter, setLabelFilter] = useState('');

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isBulkDeleteOpen, onOpen: onBulkDeleteOpen, onClose: onBulkDeleteClose } = useDisclosure();

  const cancelRef = React.useRef();
  const toast = useToast();

  const sortedDeals = useMemo(() => {
    let filteredDeals = [...deals];
    
    // Apply label filter
    if (labelFilter) {
      filteredDeals = filteredDeals.filter(deal => {
        const userLabels = deal.status_labels || [];
        const systemLabels = getSystemLabels(deal);
        const allLabels = [...userLabels, ...systemLabels];
        return allLabels.includes(labelFilter);
      });
    }
    
    // Apply sorting
    if (sortConfig.key !== null) {
      filteredDeals.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredDeals;
  }, [deals, sortConfig, labelFilter]);

  // Get all unique labels for filter dropdown
  const getAllLabels = useMemo(() => {
    const labelCounts = {};
    deals.forEach(deal => {
      const userLabels = deal.status_labels || [];
      const systemLabels = getSystemLabels(deal);
      const allLabels = [...userLabels, ...systemLabels];
      
      allLabels.forEach(label => {
        labelCounts[label] = (labelCounts[label] || 0) + 1;
      });
    });
    
    return Object.entries(labelCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, count]) => ({ label, count }));
  }, [deals]);

  const allSelected = selectedDeals.size > 0 && selectedDeals.size === deals.length;
  const isIndeterminate = selectedDeals.size > 0 && selectedDeals.size < deals.length;

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {return null;}
    return sortConfig.direction === 'ascending' ? <TriangleUpIcon aria-label="sorted ascending" /> : <TriangleDownIcon aria-label="sorted descending" />;
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedDeals(new Set());
    } else {
      setSelectedDeals(new Set(deals.map(deal => deal.id)));
    }
  };

  const handleSelectDeal = (dealId) => {
    const newSelected = new Set(selectedDeals);
    if (newSelected.has(dealId)) {
      newSelected.delete(dealId);
    } else {
      newSelected.add(dealId);
    }
    setSelectedDeals(newSelected);
  };

  // Inline editing handlers
  const startEditing = (deal) => {
    setEditingDeal(deal.id);
    setEditValues({
      brand_partner: deal.brand_partner || deal.payor_name || '',
      fmv: deal.fmv || 0,
      status: deal.status || 'draft'
    });
  };

  const cancelEditing = () => {
    setEditingDeal(null);
    setEditValues({});
  };

  const saveEdit = async (dealId) => {
    setIsDeleting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // Optimistic update
      const originalDeal = deals.find(d => d.id === dealId);
      const updatedDeal = { ...originalDeal, ...editValues };
      setDeals(deals.map(deal => deal.id === dealId ? updatedDeal : deal));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editValues)
      });

      if (!response.ok) {
        // Rollback on error
        setDeals(deals.map(deal => deal.id === dealId ? originalDeal : deal));
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update the deal.');
      }

      const responseData = await response.json();
      setDeals(deals.map(deal => deal.id === dealId ? responseData : deal));

      toast({
        title: "Deal Updated",
        description: "Deal has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onDealUpdated) {
        await onDealUpdated();
      }

    } catch(error) {
      toast({
        title: "Error Updating Deal",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setEditingDeal(null);
      setEditValues({});
    }
  };

  const handleStatusChange = async (dealId, newStatus) => {
    const originalDeal = deals.find(d => d.id === dealId);
    const updatedDeal = { ...originalDeal, status: newStatus };

    // Optimistic update
    setDeals(deals.map(deal => deal.id === dealId ? updatedDeal : deal));

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        // Rollback on error
        setDeals(deals.map(deal => deal.id === dealId ? originalDeal : deal));
        throw new Error('Failed to update status');
      }

      toast({
        title: "Status Updated",
        description: `Deal status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      setDeals(deals.map(deal => deal.id === dealId ? originalDeal : deal));
      toast({
        title: "Error",
        description: "Failed to update deal status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLabelsChange = async (dealId, newLabels) => {
    const originalDeal = deals.find(d => d.id === dealId);
    const updatedDeal = { ...originalDeal, status_labels: newLabels };

    // Optimistic update
    setDeals(deals.map(deal => deal.id === dealId ? updatedDeal : deal));

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status_labels: newLabels })
      });

      if (!response.ok) {
        // Rollback on error
        setDeals(deals.map(deal => deal.id === dealId ? originalDeal : deal));
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update labels');
      }

      toast({
        title: "Labels Updated",
        description: "Deal labels updated successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

    } catch (error) {
      setDeals(deals.map(deal => deal.id === dealId ? originalDeal : deal));
      toast({
        title: "Error",
        description: error.message || "Failed to update deal labels",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Compute system labels for a deal
  const getSystemLabels = (deal) => {
    const systemLabels = [];
    
    // Add "FMV Calculated" if valuation prediction exists
    if (deal.valuation_prediction) {
      systemLabels.push('FMV Calculated');
    }
    
    // Add "Cleared by NIL Go" if clearinghouse result is approved
    if (deal.clearinghouse_result === 'approved') {
      systemLabels.push('Cleared by NIL Go');
    }
    
    return systemLabels;
  };

  // Delete handlers
  const openDeleteConfirm = (deal) => {
    setDealToDelete(deal);
    onDeleteOpen();
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) {return;}

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
      setSelectedDeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(dealToDelete.id);
        return newSet;
      });

      toast({
        title: "Deal Deleted",
        description: `Deal with ${dealToDelete.brand_partner || dealToDelete.payor_name || 'N/A'} has been deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

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
      onDeleteClose();
      setDealToDelete(null);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    setIsBulkOperating(true);
    const dealIds = Array.from(selectedDeals);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // Delete deals in parallel
      const deletePromises = dealIds.map(dealId =>
        fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter(response => !response.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} deals`);
      }

      setDeals(deals.filter(deal => !selectedDeals.has(deal.id)));
      setSelectedDeals(new Set());

      toast({
        title: "Bulk Delete Successful",
        description: `Successfully deleted ${dealIds.length} deals.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      if (onDealDeleted) {
        await onDealDeleted();
      }

    } catch(error) {
      toast({
        title: "Bulk Delete Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsBulkOperating(false);
      onBulkDeleteClose();
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    setIsBulkOperating(true);
    const dealIds = Array.from(selectedDeals);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // Update deals in parallel
      const updatePromises = dealIds.map(dealId =>
        fetch(`${import.meta.env.VITE_API_URL}/api/deals/${dealId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })
      );

      const responses = await Promise.all(updatePromises);
      const failedUpdates = responses.filter(response => !response.ok);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} deals`);
      }

      setDeals(deals.map(deal =>
        selectedDeals.has(deal.id) ? { ...deal, status: newStatus } : deal
      ));

      toast({
        title: "Bulk Update Successful",
        description: `Successfully updated ${dealIds.length} deals to ${newStatus}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch(error) {
      toast({
        title: "Bulk Update Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) {return 'N/A';}
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return 'Invalid Date';}
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const renderEditableCell = (deal, field, value, type = 'text') => {
    const isEditing = editingDeal === deal.id;

    if (!isEditing) {
      return (
        <Text onClick={() => startEditing(deal)} cursor="pointer" _hover={{ bg: 'gray.50' }}>
          {value || 'N/A'}
        </Text>
      );
    }

    if (type === 'select') {
      return (
        <Select
          size="sm"
          value={editValues[field] || ''}
          onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      );
    }

    return (
      <Input
        size="sm"
        type={type}
        value={editValues[field] || ''}
        onChange={(e) => setEditValues(prev => ({
          ...prev,
          [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
        }))}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {saveEdit(deal.id);}
          if (e.key === 'Escape') {cancelEditing();}
        }}
      />
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Bulk Operations Toolbar */}
      {selectedDeals.size > 0 && (
        <Flex
          bg="brand.backgroundLight"
          p={4}
          borderRadius="md"
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={3}
        >
          <Text color="brand.textPrimary" fontWeight="medium">
            {selectedDeals.size} deal{selectedDeals.size > 1 ? 's' : ''} selected
          </Text>
          <Spacer display={{ base: "none", md: "block" }} />
          <Flex
            gap={2}
            flexWrap="wrap"
            justify={{ base: "center", md: "flex-end" }}
            w={{ base: "full", md: "auto" }}
          >
            <Select
              placeholder="Change Status"
              onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value)}
              isDisabled={isBulkOperating}
              minW="140px"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={onBulkDeleteOpen}
              isLoading={isBulkOperating}
              minW="120px"
            >
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedDeals(new Set())}
              minW="120px"
            >
              Clear Selection
            </Button>
          </Flex>
        </Flex>
      )}

      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  isChecked={allSelected}
                  isIndeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </Th>
              <Th cursor="pointer" onClick={() => requestSort('brand_partner')}>
                Brand {getSortIcon('brand_partner')}
              </Th>
              <Th cursor="pointer" onClick={() => requestSort('fmv')}>
                FMV {getSortIcon('fmv')}
              </Th>
              <Th>
                <Flex align="center" gap={2}>
                  <Text cursor="pointer" onClick={() => requestSort('status')}>
                    Status {getSortIcon('status')}
                  </Text>
                  <Select
                    placeholder="All"
                    size="sm"
                    w="120px"
                    value={labelFilter}
                    onChange={(e) => setLabelFilter(e.target.value)}
                  >
                    {getAllLabels.map(({ label, count }) => (
                      <option key={label} value={label}>
                        {label} ({count})
                      </option>
                    ))}
                  </Select>
                </Flex>
              </Th>
              <Th>Analysis Results</Th>
              <Th cursor="pointer" onClick={() => requestSort('created_at')}>
                Date Added {getSortIcon('created_at')}
              </Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedDeals.map((deal) => {
              const isEditing = editingDeal === deal.id;
              return (
                <Tr key={deal.id} bg={selectedDeals.has(deal.id) ? 'blue.50' : 'inherit'}>
                  <Td>
                    <Checkbox
                      isChecked={selectedDeals.has(deal.id)}
                      onChange={() => handleSelectDeal(deal.id)}
                    />
                  </Td>
                  <Td>
                    {renderEditableCell(deal, 'brand_partner', deal.brand_partner || deal.payor_name)}
                  </Td>
                  <Td>
                    {isEditing ? (
                      renderEditableCell(deal, 'fmv', deal.fmv, 'number')
                    ) : (
                      <Text onClick={() => startEditing(deal)} cursor="pointer" _hover={{ bg: 'gray.50' }}>
                        ${deal.fmv ? deal.fmv.toFixed(2) : '0.00'}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {isEditing ? (
                      renderEditableCell(deal, 'status', deal.status, 'select')
                    ) : (
                      <StatusMenu 
                        labels={deal.status_labels || []}
                        systemLabels={getSystemLabels(deal)}
                        onChange={(newLabels) => handleLabelsChange(deal.id, newLabels)}
                      />
                    )}
                  </Td>
                  <Td>
                    <ResultBadges deal={deal} />
                  </Td>
                  <Td>{formatDate(deal.created_at)}</Td>
                  <Td>
                    {isEditing ? (
                      <ButtonGroup size="sm">
                        <Tooltip label="Save Changes">
                          <IconButton
                            icon={<CheckIcon />}
                            colorScheme="green"
                            onClick={() => saveEdit(deal.id)}
                            isLoading={isDeleting}
                            size="sm"
                          />
                        </Tooltip>
                        <Tooltip label="Cancel">
                          <IconButton
                            icon={<CloseIcon />}
                            onClick={cancelEditing}
                            size="sm"
                          />
                        </Tooltip>
                      </ButtonGroup>
                    ) : (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label='Options'
                          icon={<HamburgerIcon />}
                          variant='outline'
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<EditIcon />}
                            onClick={() => startEditing(deal)}
                          >
                            Edit Deal
                          </MenuItem>
                          <MenuItem
                            icon={<ViewIcon />}
                            onClick={() => {/* TODO: Implement view modal */}}
                          >
                            View Details
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            icon={<DeleteIcon />}
                            color="red.500"
                            onClick={() => openDeleteConfirm(deal)}
                          >
                            Delete Deal
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
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
              <Button ref={cancelRef} onClick={onDeleteClose}>
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isBulkDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onBulkDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Multiple Deals
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={4}>
                Are you sure you want to delete {selectedDeals.size} selected deal{selectedDeals.size > 1 ? 's' : ''}?
              </Text>
              <Text fontSize="sm" color="gray.600">
                This action cannot be undone. All selected deals and their analysis results will be permanently removed.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onBulkDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleBulkDelete}
                ml={3}
                isLoading={isBulkOperating}
                loadingText="Deleting..."
              >
                Delete {selectedDeals.size} Deal{selectedDeals.size > 1 ? 's' : ''}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default DealsTable;