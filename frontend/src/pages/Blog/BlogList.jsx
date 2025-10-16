import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, VStack, Card, CardBody, Heading, Text, Button, HStack, Box } from '@chakra-ui/react';
import { getAllPosts } from '../../data/blogPosts';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const BlogList = () => {
  const posts = getAllPosts();
  const { user } = useAuth();

  return (
    <Container maxW="4xl" py={12}>
      <VStack align="stretch" spacing={6}>
        <Heading size="xl" color="brand.textPrimary">Blog</Heading>
        {posts.map((p) => (
          <Card key={p.slug} bg="white" borderColor="brand.accentSecondary">
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md" color="brand.textPrimary">{p.title}</Heading>
                <HStack color="brand.textSecondary" fontSize="sm">
                  <Text>{formatDate(p.date)}</Text>
                  <Box as="span">•</Box>
                  <Text>{p.author}</Text>
                </HStack>
                <Text color="brand.textSecondary">{p.excerpt}</Text>
                <Button as={RouterLink} to={`/blog/${p.slug}`} alignSelf="flex-start" bg="brand.accentPrimary" color="white" _hover={{ opacity: 0.9 }}>
                  Read more
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Container>
    {!user && <Footer />}
  );
};

export default BlogList;


