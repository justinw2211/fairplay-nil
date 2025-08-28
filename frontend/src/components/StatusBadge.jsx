// src/components/StatusBadge.jsx
import React from 'react';
import { Badge } from '@chakra-ui/react';

const statusColors = {
  'FMV Calculated': 'gray',
  'FMV Valuation Complete': 'cyan',
  'In Negotiation': 'blue',
  'Accepted': 'purple',
  'Active': 'green',
  'Completed': 'orange',
  'Cleared by NIL Go': 'teal',
};

const StatusBadge = ({ status, size = "md" }) => {
  const sizeProps = {
    sm: {
      fontSize: "xs",
      px: 2,
      py: 1,
      minH: "20px"
    },
    md: {
      fontSize: "sm",
      px: 3,
      py: 1,
      minH: "24px"
    }
  };

  return (
    <Badge 
      colorScheme={statusColors[status] || 'gray'}
      variant="solid"
      borderRadius="md"
      fontWeight="medium"
      {...sizeProps[size]}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;