// frontend/src/pages/DealWizard/ContractUpload.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  FormControl,
  Input,
  Progress,
  Text,
  HStack,
  Icon,
  useToast
} from '@chakra-ui/react';
import { CheckCircleIcon, AttachmentIcon } from '@chakra-ui/icons';

const ContractUpload = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a PDF file.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
        return;
    }
    
    setFileName(file.name);
    await uploadContract(file);
  };

  const uploadContract = async (file) => {
    try {
      setUploading(true);
      const filePath = `public/${user.id}/${uuidv4()}-${file.name}`;

      const { error } = await supabase.storage
        .from('contracts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        });

      if (error) {
        throw error;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrlData.publicUrl);
      
      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error uploading contract:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} borderColor="brand.accentSecondary">
        <FormControl>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                style={{ display: 'none' }}
                disabled={uploading}
            />
            <Button
                leftIcon={<AttachmentIcon />}
                onClick={() => fileInputRef.current.click()}
                isLoading={uploading}
                loadingText="Uploading..."
                variant="outline"
            >
                Choose PDF
            </Button>
        </FormControl>
        
        {fileName && !uploading && (
            <HStack mt={3} spacing={2} color="green.500">
                <Icon as={CheckCircleIcon} />
                <Text fontSize="sm" fontWeight="medium">{fileName}</Text>
            </HStack>
        )}
    </Box>
  );
};

export default ContractUpload;