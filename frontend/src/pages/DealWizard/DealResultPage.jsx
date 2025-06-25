// frontend/src/pages/DealWizard/DealResultPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Icon,
  Flex,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';

const DealResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || { result: null };

  if (!result) {
    // Handle case where user navigates here directly
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2}>No Result Found</Heading>
        <Text color={'gray.500'}>Please complete a deal check to see results.</Text>
        <Button
          colorScheme="pink"
          bg="brand.accentPrimary"
          color="white"
          variant="solid"
          mt={6}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  const isYellow = result.compliance_score === 'Yellow';
  const icon = isYellow ? WarningTwoIcon : CheckCircleIcon;
  const color = isYellow ? 'yellow.500' : 'green.500';
  const title = isYellow ? 'Compliance Warning' : 'Compliance Check Passed';

  return (
    <Flex align="center" justify="center" minH="80vh">
        <Box textAlign="center" py={10} px={6} borderWidth="1px" borderRadius="xl" boxShadow="lg" maxW="lg">
            <Icon as={icon} boxSize={'50px'} color={color} />
            <Heading as="h2" size="xl" mt={6} mb={2} color={color}>{title}</Heading>
            
            {result.compliance_flags && result.compliance_flags.length > 0 && (
                <Box textAlign="left" mt={6}>
                    <Text fontWeight="bold" color="brand.textPrimary">Key Considerations:</Text>
                    <List spacing={2} mt={2}>
                        {result.compliance_flags.map((flag, index) => (
                            <ListItem key={index}>
                                <ListIcon as={WarningTwoIcon} color="yellow.500" />
                                {flag}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            <Text color={'gray.500'} mt={6}>
                Your deal has been successfully logged. You can view and manage it on your dashboard.
                This preliminary check does not guarantee final approval from compliance authorities.
            </Text>

            <Button
                colorScheme="pink"
                bg="brand.accentPrimary"
                color="white"
                variant="solid"
                mt={8}
                onClick={() => navigate('/dashboard')}
            >
                Return to Dashboard
            </Button>
        </Box>
    </Flex>
  );
};

export default DealResultPage;