import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, VStack, Heading, Text, HStack, Button, Box } from '@chakra-ui/react';
import { getPostBySlug } from '../../data/blogPosts';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const BlogArticle = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <Container maxW="3xl" py={12}>
        <VStack spacing={4}>
          <Heading size="lg" color="brand.textPrimary">Article not found</Heading>
          <Text color="brand.textSecondary">The article you’re looking for doesn’t exist.</Text>
          <Button as={RouterLink} to="/blog" bg="brand.accentPrimary" color="white" _hover={{ opacity: 0.9 }}>Back to Blog</Button>
        </VStack>
      </Container>
    );
  }

  const paragraphs = String(post.content || '').split(/\n\n+/);

  return (
    <Box>
      <Container maxW="3xl" py={12}>
        <VStack align="start" spacing={4}>
          <Heading size="xl" color="brand.textPrimary">{post.title}</Heading>
          <HStack color="brand.textSecondary" fontSize="sm">
            <Text>{formatDate(post.date)}</Text>
            <Box as="span">•</Box>
            <Text>{post.author}</Text>
          </HStack>
          {paragraphs.map((para, idx) => (
            <Text key={idx} color="brand.textPrimary">{para}</Text>
          ))}
          <Button as={RouterLink} to="/blog" variant="outline" borderColor="brand.accentSecondary" color="brand.textSecondary" _hover={{ bg: 'brand.backgroundLight', borderColor: 'brand.accentPrimary', color: 'brand.textPrimary' }}>Back to Blog</Button>
        </VStack>
      </Container>
      {!user && <Footer />}
    </Box>
  );
};

export default BlogArticle;


