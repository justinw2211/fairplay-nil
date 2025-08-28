// src/components/StatusMenu.jsx
import React from 'react';
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Button, 
  Checkbox, 
  HStack, 
  Tooltip,
  Text,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import StatusBadge from './StatusBadge.jsx';

const userSelectableLabels = [
  'In Negotiation',
  'Accepted', 
  'Active',
  'Completed',
  'Cleared by NIL Go'
];

const StatusMenu = ({ labels = [], systemLabels = [], onChange }) => {
  const allLabels = [...new Set([...labels, ...systemLabels])];
  
  const handleLabelToggle = (label) => {
    const isSystemLabel = systemLabels.includes(label);
    let newLabels;
    
    if (labels.includes(label)) {
      // Remove label (system labels can be removed but will reappear if data exists)
      newLabels = labels.filter(l => l !== label);
    } else {
      // Add label
      newLabels = [...labels, label];
    }
    
    onChange(newLabels);
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" size="sm" w="100%">
        <HStack spacing={1} flexWrap="wrap" maxW="200px">
          {allLabels.length > 0 ? (
            allLabels.slice(0, 2).map(label => (
              <StatusBadge key={label} status={label} />
            ))
          ) : (
            <Text fontSize="sm" color="gray.500">No labels</Text>
          )}
          {allLabels.length > 2 && (
            <Text fontSize="sm" color="gray.500">+{allLabels.length - 2}</Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList minW="240px">
        {userSelectableLabels.map(label => {
          const isChecked = allLabels.includes(label);
          const isSystemLabel = systemLabels.includes(label);
          
          return (
            <MenuItem key={label} onClick={() => handleLabelToggle(label)}>
              <Flex align="center" w="100%">
                <Checkbox
                  isChecked={isChecked}
                  onChange={() => handleLabelToggle(label)}
                  mr={3}
                />
                <StatusBadge status={label} />
                <Spacer />
                {isSystemLabel && (
                  <Tooltip label="Auto-added based on deal data" placement="left">
                    <Text fontSize="xs" color="gray.500" ml={2}>
                      Auto
                    </Text>
                  </Tooltip>
                )}
              </Flex>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};

export default StatusMenu;