// frontend/src/pages/DealWizard/Step1_DealTerms.jsx
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import DealWizardLayout from './DealWizardLayout';
import { Box, Button, Input, Text, VStack, Icon, useToast, Progress } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { supabase } from '../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const Step1_DealTerms = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal, loading } = useDeal();
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique path for the file in Supabase Storage
      const filePath = `public/deal-terms/${deal.user_id}/${uuidv4()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contracts') // Assuming your storage bucket is named 'contracts'
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Track upload progress
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filePath);
      
      // Save the URL to the database via our API
      await updateDeal(dealId, { deal_terms_url: urlData.publicUrl });
      
      toast({
        title: "File Uploaded",
        description: "Your deal terms have been successfully attached.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const onContinue = () => {
    // Navigate to the next step in the wizard
    navigate(`/add/deal/payor/${dealId}`);
  };

  return (
    <DealWizardLayout
      title="Upload your deal terms"
      instructions="This can include a contract, an email, or screenshots of correspondence."
      onContinue={onContinue}
    >
      <VStack spacing={6} p={8} borderWidth={1} borderRadius="md" borderColor="gray.200">
        <Text color="brand.textPrimary">
            Uploading a contract is recommended but optional to proceed.
        </Text>
        
        {/* Display feedback based on whether a contract has been uploaded */}
        {deal?.deal_terms_url ? (
            <VStack spacing={3} color="green.500">
                <Icon as={CheckCircleIcon} w={8} h={8} />
                <Text fontWeight="bold">Contract on file. You can now proceed.</Text>
                <Text fontSize="sm" as="a" href={deal.deal_terms_url} target="_blank" rel="noopener noreferrer" textDecor="underline">View Uploaded File</Text>
            </VStack>
        ) : (
             <VStack spacing={3} color="orange.500">
                <Icon as={WarningIcon} w={8} h={8} />
                <Text fontWeight="bold">No contract has been uploaded yet.</Text>
            </VStack>
        )}
        
        {/* File input button */}
        <Box>
            <Button as="label" htmlFor="file-upload" cursor="pointer" isLoading={uploading}>
                {deal?.deal_terms_url ? 'Upload a Different File' : 'Upload File'}
            </Button>
            <Input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.docx" />
        </Box>

        {/* Progress bar during upload */}
        {uploading && (
            <Box w="full">
                <Progress value={uploadProgress} size="sm" colorScheme="pink" hasStripe isAnimated />
                <Text textAlign="center" mt={2}>{uploadProgress}%</Text>
            </Box>
        )}
      </VStack>
    </DealWizardLayout>
  );
};

export default Step1_DealTerms;