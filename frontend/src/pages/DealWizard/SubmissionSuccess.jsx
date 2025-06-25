// frontend/src/pages/DealWizard/SubmissionSuccess.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const SubmissionSuccess = () => {
    const navigate = useNavigate();

    return (
        <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={6} textAlign="center" p={8}>
                <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
                <Heading as="h1" size="xl">Submission Successful!</Heading>
                <Text fontSize="lg" color="gray.600">
                    Your deal has been successfully submitted for review. You can track its status on your dashboard.
                </Text>
                <Button 
                    size="lg"
                    colorScheme="pink" 
                    bg="brand.accentPrimary" 
                    color="white" 
                    onClick={() => navigate('/dashboard')}
                    _hover={{ bg: '#c8aeb0' }}
                >
                    Return to Dashboard
                </Button>
            </VStack>
        </Flex>
    );
};

export default SubmissionSuccess;