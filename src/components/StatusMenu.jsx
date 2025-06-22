// src/components/StatusMenu.jsx
import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import StatusBadge from './StatusBadge.jsx'; // FIX: Added .jsx extension

const statuses = [
  'FMV Calculated',
  'In Negotiation',
  'Accepted',
  'Active',
  'Completed',
  'Cleared by NIL Go',
];

const StatusMenu = ({ currentStatus, onSelect }) => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" size="sm" w="100%">
        <StatusBadge status={currentStatus} />
      </MenuButton>
      <MenuList>
        {statuses.map(status => (
          <MenuItem key={status} onClick={() => onSelect(status)}>
            <StatusBadge status={status} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default StatusMenu;