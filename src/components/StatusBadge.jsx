// src/components/StatusBadge.jsx
import React from 'react';
import { Badge } from '@chakra-ui/react';

const statusColors = {
  'FMV Calculated': 'gray',
  'In Negotiation': 'blue',
  'Accepted': 'purple',
  'Active': 'green',
  'Completed': 'orange',
  'Cleared by NIL Go': 'teal',
};

const StatusBadge = ({ status }) => {
  return (
    <Badge colorScheme={statusColors[status] || 'gray'}>
      {status}
    </Badge>
  );
};

export default StatusBadge;