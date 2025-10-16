import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

export default function LegalPageLayout({ title, children }) {
  return (
    <Box bg="white" minH="100vh" py={12}>
      <Container maxW="4xl">
        <VStack align="start" spacing={8}>
          <Box>
            <Heading 
              as="h1" 
              size="2xl" 
              color="brand.textPrimary" 
              mb={4}
              textAlign="left"
            >
              {title}
            </Heading>
            <Text 
              color="brand.textSecondary" 
              fontSize="lg"
              mb={2}
            >
              <strong>Effective Date:</strong> October 1, 2025
            </Text>
            <Text 
              color="brand.textSecondary" 
              fontSize="lg"
            >
              <strong>Contact:</strong> <a href="mailto:wachtelj22@gmail.com" style={{ color: '#3182CE' }}>wachtelj22@gmail.com</a>
            </Text>
          </Box>

          <Box 
            w="full" 
            sx={{
              '& h2': {
                color: 'brand.textPrimary',
                fontSize: 'xl',
                fontWeight: 'bold',
                mt: 8,
                mb: 4,
                textAlign: 'left'
              },
              '& h3': {
                color: 'brand.textPrimary',
                fontSize: 'lg',
                fontWeight: 'semibold',
                mt: 6,
                mb: 3,
                textAlign: 'left'
              },
              '& p': {
                color: 'brand.textSecondary',
                lineHeight: '1.7',
                mb: 4,
                textAlign: 'left'
              },
              '& ul': {
                color: 'brand.textSecondary',
                lineHeight: '1.7',
                mb: 4,
                pl: 6
              },
              '& li': {
                mb: 2
              },
              '& strong': {
                color: 'brand.textPrimary',
                fontWeight: 'bold'
              },
              '& a': {
                color: '#3182CE',
                textDecoration: 'underline'
              },
              '& hr': {
                borderColor: 'gray.300',
                my: 8
              }
            }}
          >
            {children}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
