import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <VStack justify="center" minH="calc(100vh - 88px)" spacing={4}>
      <Heading>404 - Page Not Found</Heading>
      <Text>The page you are looking for does not exist.</Text>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </VStack>
  );
}