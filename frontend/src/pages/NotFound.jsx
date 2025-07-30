import React from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="2xl" py={20}>
      <VStack spacing={8} align="center" textAlign="center">
        <Heading size="2xl" color="brand.textPrimary">
          404 - Page Not Found
        </Heading>
        <Text fontSize="xl" color="brand.textSecondary">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Box pt={4}>
          <Button
            size="lg"
            colorScheme="pink"
            bg="brand.accentPrimary"
            color="white"
            onClick={() => navigate('/')}
            _hover={{ bg: '#c8aeb0' }}
          >
            Return Home
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default NotFound;