// src/components/DealsTable.jsx
import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { MoreHorizontal } from 'react-feather';
import StatusBadge from './StatusBadge.jsx'; // FIX: Added .jsx extension
import StatusMenu from './StatusMenu.jsx'; // FIX: Added .jsx extension

const DealsTable = ({ deals, onStatusUpdate, onDelete }) => {
  const [sortConfig, setSortConfig] = React.useState({ key: 'created_at', direction: 'descending' });

  const sortedDeals = React.useMemo(() => {
    let sortableItems = [...deals];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
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
    if (sortConfig.direction === 'ascending') return <TriangleUpIcon aria-label="sorted ascending" ml={1} />;
    return <TriangleDownIcon aria-label="sorted descending" ml={1} />;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th cursor="pointer" onClick={() => requestSort('brand_partner')}>Brand {getSortIcon('brand_partner')}</Th>
            <Th isNumeric cursor="pointer" onClick={() => requestSort('fmv')}>FMV {getSortIcon('fmv')}</Th>
            <Th cursor="pointer" onClick={() => requestSort('created_at')}>Date {getSortIcon('created_at')}</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedDeals.map((deal) => (
            <Tr key={deal.id}>
              <Td>{deal.brand_partner}</Td>
              <Td isNumeric>{formatCurrency(deal.fmv)}</Td>
              <Td>{formatDate(deal.created_at)}</Td>
              <Td>
                <StatusMenu currentStatus={deal.status} onSelect={(newStatus) => onStatusUpdate(deal.id, newStatus)} />
              </Td>
              <Td>
                <Menu>
                  <MenuButton as={IconButton} aria-label="Options" icon={<MoreHorizontal size={16}/>} variant="ghost" />
                  <MenuList>
                    <MenuItem>View Details</MenuItem>
                    <MenuItem>Download Report</MenuItem>
                    <MenuItem onClick={() => onDelete(deal)} color="red.500">Delete</MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default DealsTable;