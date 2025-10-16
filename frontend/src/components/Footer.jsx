// frontend/src/components/Footer.jsx
import React from 'react';
import { Box, Container, Grid, Heading, HStack, Icon, Link, VStack } from '@chakra-ui/react';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <Box bg="brand.backgroundLight" py={12}>
      <Container maxW="7xl">
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
          {/* Logo */}
          <VStack align="start">
            <Link href="/" _hover={{ opacity: 0.9 }}>
              <Box as="img" src="/logo-full.svg" alt="FairPlay NIL" height="32px" />
            </Link>
          </VStack>

          {/* Products */}
          <VStack align="start">
            <Heading size="sm" color="brand.textPrimary" mb={4}>
              Products
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/athletes" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Athletes
              </Link>
              <Link href="/universities" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Universities
              </Link>
              <Link href="/brands" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Brands
              </Link>
              <Link href="/collectives" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Collectives
              </Link>
            </VStack>
          </VStack>

          {/* Company */}
          <VStack align="start">
            <Heading size="sm" color="brand.textPrimary" mb={4}>
              Company
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/about" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                About Us
              </Link>
              <Link href="/blog" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Blogs
              </Link>
              <Link href="/contact" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Contact
              </Link>
            </VStack>
          </VStack>

          {/* Legal */}
          <VStack align="start">
            <Heading size="sm" color="brand.textPrimary" mb={4}>
              Legal
            </Heading>
            <VStack align="start" spacing={2}>
              <Link href="/privacy" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Terms of Use
              </Link>
              <Link href="/terms" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
                Terms of Service
              </Link>
            </VStack>
          </VStack>
        </Grid>

        {/* Social Media Icons */}
        <HStack justify="center" spacing={6} mt={8} pt={8} borderTop="1px" borderColor="gray.300">
          <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
            <Icon as={Twitter} boxSize={6} />
          </Link>
          <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
            <Icon as={Instagram} boxSize={6} />
          </Link>
          <Link href="#" color="brand.textSecondary" _hover={{ opacity: 0.8 }}>
            <Icon as={Linkedin} boxSize={6} />
          </Link>
        </HStack>
      </Container>
    </Box>
  );
}


