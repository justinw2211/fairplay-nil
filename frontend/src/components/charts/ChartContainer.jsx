import React from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Heading, 
  Box, 
  Spinner, 
  Text, 
  VStack,
  useColorModeValue 
} from '@chakra-ui/react';
import { useTheme } from '@chakra-ui/react';

const ChartContainer = ({ 
  title, 
  subtitle, 
  children, 
  isLoading = false, 
  error = null,
  height = "400px",
  ...props 
}) => {
  const theme = useTheme();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Card 
        bg={cardBg} 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="lg"
        {...props}
      >
        <CardHeader>
          <Heading size="md" color="brand.textPrimary">{title}</Heading>
          {subtitle && (
            <Text color="brand.textSecondary" fontSize="sm" mt={1}>
              {subtitle}
            </Text>
          )}
        </CardHeader>
        <CardBody>
          <VStack justify="center" align="center" h={height}>
            <Spinner size="xl" color="brand.accentPrimary" />
            <Text color="brand.textSecondary">Loading chart data...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        bg={cardBg} 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="lg"
        {...props}
      >
        <CardHeader>
          <Heading size="md" color="brand.textPrimary">{title}</Heading>
          {subtitle && (
            <Text color="brand.textSecondary" fontSize="sm" mt={1}>
              {subtitle}
            </Text>
          )}
        </CardHeader>
        <CardBody>
          <VStack justify="center" align="center" h={height}>
            <Text color="red.500">Error loading chart data</Text>
            <Text color="brand.textSecondary" fontSize="sm">
              {error}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: 'md',
        borderColor: 'brand.accentPrimary'
      }}
      {...props}
    >
      <CardHeader>
        <Heading size="md" color="brand.textPrimary">{title}</Heading>
        {subtitle && (
          <Text color="brand.textSecondary" fontSize="sm" mt={1}>
            {subtitle}
          </Text>
        )}
      </CardHeader>
      <CardBody>
        <Box h={height} w="full">
          {children}
        </Box>
      </CardBody>
    </Card>
  );
};

export default ChartContainer; 