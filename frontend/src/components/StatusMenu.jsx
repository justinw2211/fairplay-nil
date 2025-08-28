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

  const renderLabelDisplay = () => {
    if (allLabels.length === 0) {
      return (
        <Text fontSize="sm" color="gray.500" fontWeight="normal">
          No status
        </Text>
      );
    }

    if (allLabels.length === 1) {
      return <StatusBadge status={allLabels[0]} />;
    }

    if (allLabels.length <= 3) {
      return (
        <HStack spacing={1} flexWrap="wrap">
          {allLabels.map(label => (
            <StatusBadge key={label} status={label} size="sm" />
          ))}
        </HStack>
      );
    }

    // More than 3 labels - show first 2 plus count
    return (
      <HStack spacing={1} align="center">
        {allLabels.slice(0, 2).map(label => (
          <StatusBadge key={label} status={label} size="sm" />
        ))}
        <Text fontSize="xs" color="gray.600" fontWeight="medium" px={2} py={1} bg="gray.100" borderRadius="md">
          +{allLabels.length - 2}
        </Text>
      </HStack>
    );
  };

  return (
    <Menu closeOnSelect={false} placement="bottom-start">
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        variant="ghost" 
        size="sm" 
        minW="fit-content"
        maxW="300px"
        h="auto"
        py={2}
        px={3}
        justifyContent="flex-start"
        _hover={{ bg: "gray.50" }}
        _active={{ bg: "gray.100" }}
      >
        <Flex align="center" justify="flex-start" w="100%">
          {renderLabelDisplay()}
        </Flex>
      </MenuButton>
      <MenuList minW="280px" maxW="400px" shadow="lg" border="1px" borderColor="gray.200">
        <Text fontSize="sm" fontWeight="semibold" color="gray.700" px={3} py={2} borderBottom="1px" borderColor="gray.100">
          Manage Status Labels
        </Text>
        {userSelectableLabels.map(label => {
          const isChecked = allLabels.includes(label);
          const isSystemLabel = systemLabels.includes(label);
          
          return (
            <MenuItem 
              key={label} 
              onClick={() => handleLabelToggle(label)}
              _hover={{ bg: "gray.50" }}
              px={3}
              py={3}
            >
              <Flex align="center" w="100%">
                <Checkbox
                  isChecked={isChecked}
                  onChange={() => handleLabelToggle(label)}
                  mr={3}
                  size="md"
                />
                <StatusBadge status={label} />
                <Spacer />
                {isSystemLabel && (
                  <Tooltip 
                    label="Automatically added based on deal data" 
                    placement="left"
                    bg="gray.700"
                    color="white"
                    fontSize="xs"
                  >
                    <Flex 
                      align="center" 
                      bg="blue.50" 
                      color="blue.600" 
                      px={2} 
                      py={1} 
                      borderRadius="md" 
                      fontSize="xs" 
                      fontWeight="medium"
                    >
                      Auto
                    </Flex>
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