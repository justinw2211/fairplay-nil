// src/pages/Dashboard.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box p={8}>
      <Heading>Dashboard</Heading>
      <Text mt={4}>
        Welcome, {user?.email}! This is your personal dashboard.
      </Text>
      <Text mt={2}>
        Full dashboard features coming in the next step.
      </Text>
    </Box>
  );
}